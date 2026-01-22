from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import osmnx as ox
import networkx as nx
from shapely.geometry import Point
import json

import config
import data_loader
import network_builder
import router

app = FastAPI(title="KNUST GIS Emergency Routing API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state = {}

@app.on_event("startup")
async def startup_event():
    print("Loading Map Data...")
    G_raw, G_proj = data_loader.load_or_create_graph()
    state["G_raw"] = G_raw
    state["G_proj"] = G_proj
    # Pre-cache locations
    state["locations"] = data_loader.get_locations(G_raw)
    print("Map Data Loaded.")

@app.get("/")
async def root():
    return {"status": "ok", "message": "KNUST Emergency GIS Backend is running!"}

@app.get("/locations")
def get_locations_endpoint():
    locs = state.get("locations", [])
    print(f"DEBUG: /locations requested. Returning {len(locs)} items.")
    return locs

class RouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    dest_lat: float
    dest_lon: float
    mode: str = "fastest" 
    transport_mode: str = "drive" 
    traffic_level: str = "normal" 

def generate_instructions(G, route_nodes):
    """Generates simple turn-by-turn text instructions."""
    instructions = []
    if not route_nodes or len(route_nodes) < 2:
        return instructions
        
    total_dist = 0
    current_road_name = None
    segment_dist = 0
    
    for i in range(len(route_nodes) - 1):
        u = route_nodes[i]
        v = route_nodes[i+1]
        data = G[u][v][0]
        
        name = data.get("name", "Unnamed Road")
        if isinstance(name, list):
            name = name[0] 
            
        length = data.get("length", 0)
        
        if current_road_name is None:
            current_road_name = name
            
        if name == current_road_name:
            segment_dist += length
        else:
            instructions.append(f"Travel {int(segment_dist)}m on {current_road_name}")
            current_road_name = name
            segment_dist = length
            
    
    instructions.append(f"Travel {int(segment_dist)}m on {current_road_name}")
    instructions.append("Arrive at destination")
    
    return instructions

@app.post("/route")
def calculate_route_endpoint(req: RouteRequest):
    G_raw = state["G_raw"]
    G_proj = state["G_proj"]

    MIN_LAT, MAX_LAT = 6.65, 6.72
    MIN_LON, MAX_LON = -1.60, -1.52

    def is_in_bounds(lat, lon):
        return MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON

    if not is_in_bounds(req.origin_lat, req.origin_lon):
        raise HTTPException(
            status_code=400, 
            detail="Origin is outside KNUST and its environs. Detailed routing is only available within the campus area."
        )
    
    if not is_in_bounds(req.dest_lat, req.dest_lon):
        raise HTTPException(
            status_code=400, 
            detail="Destination is outside KNUST and its environs. Detailed routing is only available within the campus area."
        )
    
    traffic_factor = 1.0
    if req.transport_mode == 'drive':
        if req.traffic_level == 'heavy': traffic_factor = 1.8
        elif req.traffic_level == 'low': traffic_factor = 0.8
    
    
    orig_node = ox.distance.nearest_nodes(G_raw, X=req.origin_lon, Y=req.origin_lat)
    dest_node = ox.distance.nearest_nodes(G_raw, X=req.dest_lon, Y=req.dest_lat)
    
    
    weight = 'travel_time_s' if req.mode == 'fastest' and req.transport_mode == 'drive' else 'length'
    
    
    route_nodes, _ = router.calculate_route(
        G_proj, orig_node, dest_node, 
        weight=weight, 
        transport_mode=req.transport_mode,
        traffic_factor=traffic_factor
    )
    
    if not route_nodes:
        raise HTTPException(status_code=404, detail=f"No {req.transport_mode} route found. Too far or unconnected?")
    
    dist_km, time_min = router.calculate_analytics(
        G_proj, route_nodes,
        transport_mode=req.transport_mode,
        traffic_factor=traffic_factor
    )
    
    instructions = generate_instructions(G_raw, route_nodes)
    
    path_coords = []
    path_coords.append([req.origin_lat, req.origin_lon])
    
    if route_nodes[0] in G_raw.nodes:
        start_node = G_raw.nodes[route_nodes[0]]
        path_coords.append([start_node['y'], start_node['x']])
        
    for u, v in zip(route_nodes[:-1], route_nodes[1:]):
        try:
            edge_data = G_raw[u][v][0]
            if 'geometry' in edge_data:
                linestring = edge_data['geometry']
                for x, y in linestring.coords:
                    path_coords.append([y, x])
            else:
                node_data = G_raw.nodes[v]
                path_coords.append([node_data['y'], node_data['x']])
        except KeyError:
             if v in G_raw.nodes:
                node_data = G_raw.nodes[v]
                path_coords.append([node_data['y'], node_data['x']])

    path_coords.append([req.dest_lat, req.dest_lon])
            
    return {
        "mode": req.mode,
        "transport_mode": req.transport_mode,
        "traffic_level": req.traffic_level,
        "distance_km": round(dist_km, 2),
        "time_min": round(time_min, 1), 
        "path": path_coords,
        "instructions": instructions
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
