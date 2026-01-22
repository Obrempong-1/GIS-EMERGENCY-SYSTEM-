import osmnx as ox
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import config
import networkx as nx
import network_builder

def fetch_knust_network(point=(config.KNUST_CENTER_LAT, config.KNUST_CENTER_LON), dist=config.SEARCH_RADIUS_METERS, network_type=config.NETWORK_TYPE):
    print(f"Fetching {network_type} network data from OSM around {point} with radius {dist}m...")
    G = ox.graph_from_point(point, dist=dist, network_type=network_type, simplify=True)
    print(f"Network fetched: {len(G.nodes)} nodes, {len(G.edges)} edges.")
    return G

def load_graph_from_geojson(roads_file):
    print(f"Loading local network from {roads_file}...")
    try:
        gdf_edges = gpd.read_file(roads_file)
        
        if gdf_edges.crs != config.CRS_PROJECTED:
            gdf_edges = gdf_edges.to_crs(config.CRS_PROJECTED)
            
        G = nx.Graph()
        
        for idx, row in gdf_edges.iterrows():
            geom = row.geometry
            if geom.geom_type == 'LineString':
                start_pt = geom.coords[0]
                end_pt = geom.coords[-1]
                
                G.add_node(start_pt, x=start_pt[0], y=start_pt[1])
                G.add_node(end_pt, x=end_pt[0], y=end_pt[1])
                
                length = row.get('length', geom.length)
                
                G.add_edge(start_pt, end_pt, 
                           geometry=geom, 
                           length=length,
                           name=row.get('name', 'Unnamed'),
                           highway=row.get('highway', 'road'),
                           oneway=row.get('oneway', False))
                           
        G = nx.DiGraph(G)
        
        print(f"Local Graph created: {len(G.nodes)} nodes, {len(G.edges)} edges.")
        return G
        
    except Exception as e:
        print(f"Error loading local GeoJSON: {e}")
        print("Falling back to OSM download...")
        return fetch_knust_network()


def load_or_create_graph():
    if config.DATA_SOURCE == "local":
        G_raw = load_graph_from_geojson(config.ROADS_FILE)
    else:
        G_raw = fetch_knust_network()

    if config.DATA_SOURCE != "local":
        G_proj = ox.project_graph(G_raw, to_crs=config.CRS_PROJECTED)
    else:
        G_proj = G_raw
        G_raw = ox.project_graph(G_proj, to_crs=config.CRS_WGS84)

    G_proj = network_builder.add_travel_times(G_proj)
    
    return G_raw, G_proj

def get_facilities():
    gdf_manual = gpd.GeoDataFrame(columns=["name", "type", "geometry", "phone", "opening_hours", "description"], crs=config.CRS_WGS84)

    print("Fetching detailed KNUST facilities from OSM...")
    try:
        tags = {
            'building': True, 
            'amenity': True, 
            'leisure': True, 
            'shop': True, 
            'office': True,
            'tourism': True
        }
        
        
        gdf_osm = ox.features_from_point(
            (config.KNUST_CENTER_LAT, config.KNUST_CENTER_LON), 
            tags, 
            dist=config.SEARCH_RADIUS_METERS + 500
        )
        
        if 'name' in gdf_osm.columns:
            gdf_osm = gdf_osm[gdf_osm['name'].notnull()]
            
            
            osm_records = []
            for idx, row in gdf_osm.iterrows():
                ftype = "building"
                if 'amenity' in row and pd.notnull(row['amenity']): ftype = row['amenity']
                elif 'shop' in row and pd.notnull(row['shop']): ftype = row['shop']
                elif 'office' in row and pd.notnull(row['office']): ftype = row['office']
                elif 'leisure' in row and pd.notnull(row['leisure']): ftype = row['leisure']
                
                geom = row.geometry
                if geom.geom_type in ['Polygon', 'MultiPolygon']:
                    geom = geom.centroid

                osm_records.append({
                    "name": row['name'],
                    "type": ftype,
                    "geometry": geom
                })
            
            if osm_records:
                gdf_osm_clean = gpd.GeoDataFrame(osm_records, crs=config.CRS_WGS84)
                gdf_combined = pd.concat([gdf_manual, gdf_osm_clean], ignore_index=True)
                print(f"Loaded {len(gdf_combined)} facilities ({len(gdf_manual)} manual, {len(gdf_osm_clean)} OSM).")
                return gdf_combined

    except Exception as e:
        print(f"Error fetching OSM facilities: {e}")
        return gdf_manual

    return gdf_manual

def get_locations(G=None):
    locations = []
    
    gdf_facs = get_facilities()
    
    for idx, row in gdf_facs.iterrows():
        phone = row.get("phone")
        hours = row.get("opening_hours")
        desc = row.get("description")

        # Handle NaN values from Pandas
        if pd.isna(phone): phone = None
        if pd.isna(hours): hours = None
        if pd.isna(desc): desc = None

        locations.append({
            "name": row["name"],
            "type": row["type"],
            "lat": row["geometry"].y,
            "lon": row["geometry"].x,
            "category": "facility",
            "phone": phone,
            "opening_hours": hours,
            "description": desc
        })
        
        
    return locations

if __name__ == "__main__":
    G = fetch_knust_network()
    facs = get_facilities()
    print(facs)
