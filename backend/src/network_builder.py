import osmnx as ox
import networkx as nx
import pandas as pd
import config

def project_graph(G):
    print(f"Projecting graph to {config.CRS_PROJECTED}...")
    G_proj = ox.project_graph(G, to_crs=config.CRS_PROJECTED)
    return G_proj

def add_travel_times(G):
    print("Adding edge attributes (speed, travel time)...")
    
    for u, v, k, data in G.edges(keys=True, data=True):
        
        speed = config.DRIVE_DEFAULT_SPEED_KPH
        
        if 'maxspeed' in data:
            try:
                val = data['maxspeed']
                if isinstance(val, list):
                    val = val[0]
                speed = float(val.replace(' mph', ''))
            except:
                pass
        else:
            highway = data.get('highway', 'unclassified')
            if isinstance(highway, list):
                highway = highway[0]
            
            speed = config.SPEED_LIMITS.get(highway, config.DRIVE_DEFAULT_SPEED_KPH)
            
        data['speed_kph'] = speed
        
        length_m = data['length']
        speed_mps = speed / 3.6
        if speed_mps <= 0: speed_mps = 1.0
        
        travel_time = length_m / speed_mps
        data['travel_time_s'] = travel_time
        
    return G
