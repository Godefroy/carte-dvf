// tslint:disable-next-line: no-implicit-dependencies
import { Feature, FeatureCollection, Point } from 'geojson'
// tslint:disable-next-line: no-implicit-dependencies
import { GeoJSONSource, Layer, LngLat, LngLatBounds } from 'mapbox-gl'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import MapGL, {
  InteractiveMap,
  PointerEvent,
  ViewportProps
} from 'react-map-gl'
import { IData } from '../config/interfaces'
import settings from '../settings'
import MapMarker from './MapMarker'

const dataToFeatureCollection = (data: IData[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: data
    .filter(d => d.longitude && d.latitude)
    .map(d => ({
      type: 'Feature',
      properties: d,
      geometry: { type: 'Point', coordinates: [d.longitude, d.latitude, 0] }
    }))
})

interface IProps {
  data: IData[]
}

// Adapted from:
// https://docs.mapbox.com/mapbox-gl-js/example/cluster/
// https://uber.github.io/react-map-gl/#/Examples/custom-cursor

const initialZoom = 9
const sourceId = 'dvf'
const clustersLayerId = 'clusters'
const pointsLayerId = 'unclustered-point'

const getLayer = (layerId: string): Layer => ({
  id: layerId,
  source: sourceId,
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    // with three steps to implement three types of circles:
    //   * Blue, 20px circles when point count is less than 100
    //   * Yellow, 30px circles when point count is between 100 and 750
    //   * Pink, 40px circles when point count is greater than or equal to 750
    'circle-color': [
      'step',
      ['get', 'point_count'],
      'rgba(81, 187, 214, 0.6)',
      100,
      'rgba(241, 240, 117, 0.6)',
      750,
      'rgba(242, 140, 177, 0.6)'
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
})

const CustomMap: React.FC<IProps> = ({ data }) => {
  const mapRef = useRef<InteractiveMap>(null)
  const [loading, setLoading] = useState(true)
  const [viewport, setViewport] = useState<Partial<ViewportProps>>({
    latitude: 47.204519,
    longitude: -1.563033,
    zoom: initialZoom
  })
  const [popupData, setPopupData] = useState<IData>()

  // Update data on map
  useEffect(() => {
    const map = mapRef.current && mapRef.current.getMap()
    if (loading || !map) return
    const mapSource = map.getSource(sourceId) as GeoJSONSource
    const featureCollection = dataToFeatureCollection(data)
    if (mapSource) {
      mapSource.setData(featureCollection)
    }

    // Adjust position and zoom
    if (featureCollection.features.length === 0) return
    const firstPointCoordinates = (featureCollection.features[0]
      .geometry as Point).coordinates as [number, number]
    const bounds = featureCollection.features.reduce(
      (boundsAcc, f) =>
        boundsAcc.extend(
          new LngLat(
            (f.geometry as Point).coordinates[0],
            (f.geometry as Point).coordinates[1]
          )
        ),
      new LngLatBounds(firstPointCoordinates, firstPointCoordinates)
    )

    const center = bounds.getCenter()
    setViewport({
      latitude: center.lat,
      longitude: center.lng,
      zoom: initialZoom
    })
  }, [loading, data])

  // Add Layers on load
  const handleMapLoaded = useCallback(() => {
    const map = mapRef.current && mapRef.current.getMap()
    if (!map) return

    map.addSource(sourceId, {
      type: 'geojson',
      data: dataToFeatureCollection(data),
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer(getLayer(clustersLayerId))

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    })

    map.addLayer({
      id: pointsLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    })

    setLoading(false)
  }, [data])

  // Global Click handler
  const handleClick = useCallback((event: PointerEvent) => {
    const map = mapRef.current && mapRef.current.getMap()
    if (!map) return

    // Cluster
    const clusterFeature =
      event.features &&
      (event.features as Feature[]).find(
        (f: any) => f.layer.id === clustersLayerId
      )
    if (clusterFeature) {
      const clusterId = (clusterFeature.properties as any).cluster_id
      const mapSource = map.getSource(sourceId) as GeoJSONSource
      mapSource.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error) return
        const center = (clusterFeature.geometry as any).coordinates
        setViewport({ longitude: center[0], latitude: center[1], zoom })
      })
      setPopupData(undefined)
      return
    }

    // Point
    const pointFeature =
      event.features &&
      (event.features as Feature[]).find(
        (f: any) => f.layer.id === pointsLayerId
      )
    if (pointFeature) {
      setPopupData(pointFeature.properties as any)
      return
    }

    // Outside
    setPopupData(undefined)
  }, [])

  const handleCursor = useCallback(
    ({ isHovering, isDragging }) => (isHovering ? 'pointer' : 'grab'),
    []
  )

  return (
    <MapGL
      ref={mapRef}
      {...viewport}
      width="auto"
      height="auto"
      onViewportChange={v => setViewport(v)}
      onLoad={handleMapLoaded}
      getCursor={handleCursor}
      interactiveLayerIds={[clustersLayerId, pointsLayerId]}
      onClick={handleClick}
      mapboxApiAccessToken={settings.mapbox.token}
      mapStyle="mapbox://styles/mapbox/dark-v9"
      style={{
        position: 'absolute',
        overflow: 'hidden',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
      }}
    >
      {popupData && (
        <MapMarker entry={popupData} onClose={() => setPopupData(undefined)} />
      )}
    </MapGL>
  )
}

export default CustomMap
