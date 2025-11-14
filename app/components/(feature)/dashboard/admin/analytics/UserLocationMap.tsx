"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapPin, Users, X } from "lucide-react";
import type { UserLocation } from "@/app/types/analyticServiceType";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";

// Popup 内容组件
function PopupContent({
  city,
  userCount,
  onClose,
}: {
  city: string;
  userCount: number;
  onClose?: () => void;
}) {
  return (
    <div className="p-4 sm:p-5 min-w-[200px] relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-foreground-300 hover:text-foreground-50 hover:bg-background-100 rounded-sm transition-colors"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-sm flex-shrink-0">
          <MapPin className="w-5 h-5 text-blue-500" />
        </div>
        <h4 className="text-base font-semibold text-foreground-50">{city}</h4>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border-50">
        <div className="flex items-center gap-2 text-foreground-300">
          <Users className="w-4 h-4" />
          <span className="text-xs">用户数量</span>
        </div>
        <span className="text-xl font-bold text-foreground-50">
          {userCount}
        </span>
      </div>
    </div>
  );
}

interface UserLocationMapProps {
  locations?: UserLocation[];
  isLoading?: boolean;
  error?: unknown;
}

export default function UserLocationMap({
  locations = [],
  isLoading = false,
  error,
}: UserLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 统计每个城市的用户数量
  const cityStats = React.useMemo(() => {
    const stats = new Map<string, number>();
    locations.forEach((location) => {
      stats.set(location.city, (stats.get(location.city) || 0) + 1);
    });
    return Array.from(stats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }, [locations]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // 动态导入 mapbox-gl
    import("mapbox-gl").then((mapboxgl) => {
      if (!mapContainer.current) return;

      // 设置 Mapbox token (使用公共 token 或者你自己的)
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // 初始化地图
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [105, 35], // 中国中心
        zoom: 3,
        projection: "globe" as const,
      });

      // 添加导航控件
      map.current.addControl(new mapboxgl.default.NavigationControl());

      // 地图加载完成
      map.current.on("load", () => {
        setMapLoaded(true);

        // 添加大气效果
        map.current.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6,
        });
      });
    });

    // 清理函数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 更新地图上的标记
  useEffect(() => {
    if (!map.current || !mapLoaded || !locations || locations.length === 0)
      return;

    import("mapbox-gl").then((mapboxgl) => {
      if (!map.current) return;

      // 移除旧的图层和数据源
      if (map.current.getLayer("user-locations-layer")) {
        map.current.removeLayer("user-locations-layer");
      }
      if (map.current.getLayer("user-locations-cluster")) {
        map.current.removeLayer("user-locations-cluster");
      }
      if (map.current.getLayer("user-locations-cluster-count")) {
        map.current.removeLayer("user-locations-cluster-count");
      }
      if (map.current.getSource("user-locations")) {
        map.current.removeSource("user-locations");
      }

      // 创建 GeoJSON 数据
      const geojsonData = {
        type: "FeatureCollection",
        features: locations.map((location, index) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          properties: {
            id: index,
            city: location.city,
          },
        })),
      };

      // 添加数据源
      map.current.addSource("user-locations", {
        type: "geojson",
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // 添加聚合圆圈图层
      map.current.addLayer({
        id: "user-locations-cluster",
        type: "circle",
        source: "user-locations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
        },
      });

      // 添加聚合数字图层
      map.current.addLayer({
        id: "user-locations-cluster-count",
        type: "symbol",
        source: "user-locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // 添加单个点图层
      map.current.addLayer({
        id: "user-locations-layer",
        type: "circle",
        source: "user-locations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#3B82F6",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // 添加点击事件 - 聚合点
      map.current.on(
        "click",
        "user-locations-cluster",
        (e: { point: unknown }) => {
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["user-locations-cluster"],
          });
          const clusterId = features[0].properties.cluster_id;
          map.current
            .getSource("user-locations")
            .getClusterExpansionZoom(
              clusterId,
              (err: unknown, zoom: number) => {
                if (err) return;

                map.current.easeTo({
                  center: features[0].geometry.coordinates,
                  zoom: zoom,
                });
              }
            );
        }
      );

      // 添加点击事件 - 单个点
      map.current.on(
        "click",
        "user-locations-layer",
        (e: {
          features: Array<{
            geometry: { coordinates: number[] };
            properties: { city: string };
          }>;
          lngLat: { lng: number };
        }) => {
          const coordinates = e.features[0].geometry.coordinates.slice() as [
            number,
            number
          ];
          const city = e.features[0].properties.city;

          // 确保在地图旋转时，popup 出现在正确的位置
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // 创建 popup 容器
          const popupNode = document.createElement("div");
          const userCount = cityStats.find((s) => s.city === city)?.count || 1;

          // 创建并显示 popup
          const popup = new mapboxgl.default.Popup({
            closeButton: false,
            closeOnClick: true,
            maxWidth: "280px",
            offset: 15,
          })
            .setLngLat(coordinates as [number, number])
            .setDOMContent(popupNode)
            .addTo(map.current);

          // 使用 React 渲染 popup 内容
          const root = createRoot(popupNode);
          root.render(
            <PopupContent
              city={city}
              userCount={userCount}
              onClose={() => popup.remove()}
            />
          );

          // 清理：当 popup 关闭时卸载 React 组件
          popup.on("close", () => {
            root.unmount();
          });
        }
      );

      // 鼠标悬停效果
      map.current.on("mouseenter", "user-locations-cluster", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "user-locations-cluster", () => {
        map.current.getCanvas().style.cursor = "";
      });
      map.current.on("mouseenter", "user-locations-layer", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "user-locations-layer", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, [locations, mapLoaded, cityStats]);

  if (error) {
    return (
      <ErrorDisplay
        title="加载失败"
        message={(error as any)?.message || "无法加载用户位置数据"}
        type="error"
      />
    );
  }

  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground-50">
          用户地理分布
        </h3>
        {locations && locations.length > 0 && (
          <p className="text-sm text-foreground-300">
            共 {locations.length} 个用户位置
          </p>
        )}
      </div>

      <div className="relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card-50/80 z-10 rounded-sm">
            <LoadingSpinner
              message="加载用户位置地图..."
              size="sm"
              variant="pulse"
            />
          </div>
        )}
        <div
          ref={mapContainer}
          className="w-full h-[500px] min-h-[500px] bg-background-200 rounded-sm [&_.mapboxgl-ctrl-logo]:!hidden [&_.mapboxgl-ctrl-attrib]:!hidden [&_.mapboxgl-popup-content]:!bg-card-50 [&_.mapboxgl-popup-content]:!border [&_.mapboxgl-popup-content]:!border-border-50 [&_.mapboxgl-popup-content]:!rounded-sm [&_.mapboxgl-popup-content]:!shadow-sm [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-tip]:!border-t-card-50"
        />
        {!isLoading && (!locations || locations.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-foreground-300">
              <p>暂无用户位置数据</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
