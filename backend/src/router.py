import networkx as nx
import osmnx as ox
import config

def calculate_route(G, origin_node, target_node, weight='length', transport_mode='drive', traffic_factor=1.0):
    try:
        route = nx.shortest_path(G, origin_node, target_node, weight=weight)
        
    
        cost = 0
        for i in range(len(route)-1):
            u, v = route[i], route[i+1]
            edges = G[u][v]
            if isinstance(edges, dict): 
                 edge_data = min(edges.values(), key=lambda x: x.get(weight, 0))
            else:
                 edge_data = edges[0] 
                 
            val = edge_data.get(weight, 0)
            
            if weight == 'travel_time_s' and transport_mode == 'drive':
                val *= traffic_factor
                
            cost += val
            
        return route, cost
    except nx.NetworkXNoPath:
        return None, float('inf')

def calculate_analytics(G, route, transport_mode='drive', traffic_factor=1.0):
    total_dist = 0
    total_time = 0
    
    if not route:
        return 0, 0
        
    for i in range(len(route)-1):
        u, v = route[i], route[i+1]
        edges = G[u][v]
        if isinstance(edges, dict):
             edge_data = list(edges.values())[0]
        else:
             edge_data = edges[0]
        
        length = edge_data.get('length', 0)
        total_dist += length
        
        if transport_mode == 'bike':
            speed_mps = config.BIKE_SPEED_KPH / 3.6
            seg_time = length / speed_mps
        elif transport_mode == 'walk':
            speed_mps = config.WALK_SPEED_KPH / 3.6
            seg_time = length / speed_mps
        else:
            seg_time = edge_data.get('travel_time_s', 0)
            seg_time *= traffic_factor
            
        total_time += seg_time
        
    return total_dist / 1000.0, total_time / 60.0 
