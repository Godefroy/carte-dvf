import { Tag } from '@blueprintjs/core'
import React from 'react'
import { Popup } from 'react-map-gl'
import styled from 'styled-components'
import { IData } from '../config/interfaces'

interface IProps {
  entry: IData
  onClose: () => void
}

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  h3 {
    margin-top: 0;
    margin-bottom: 1em;
    margin-right: 2em;
    font-size: 0.83em;
  }
`
const DateTag = styled.div`
  color: #666;
  font-size: 0.8em;
`
const AddressTag = styled.div`
  margin-top: 1em;
  color: #666;
  font-size: 0.8em;
`

const MapMarker: React.FC<IProps> = ({ entry, onClose }) => (
  <Popup
    tipSize={5}
    anchor="top"
    longitude={entry.longitude}
    latitude={entry.latitude}
    closeOnClick={false}
    onClose={onClose}
  >
    <div style={{ cursor: 'pointer' }}>
      <Title>
        <h3>
          {entry.nature_mutation} {entry.type_local}
        </h3>
        <DateTag>{entry.date_mutation}</DateTag>
      </Title>
      <Tag>{entry.valeur_fonciere || '?'} €</Tag>{' '}
      {entry.nombre_pieces_principales && (
        <>
          <Tag>{entry.nombre_pieces_principales} pièces</Tag>{' '}
        </>
      )}
      {entry.surface_reelle_bati &&
      entry.surface_terrain &&
      entry.surface_reelle_bati !== entry.surface_terrain ? (
        <Tag>
          {entry.surface_reelle_bati} m² - {entry.surface_terrain} m²{' '}
        </Tag>
      ) : (
        <Tag>
          {entry.surface_reelle_bati || entry.surface_terrain || '?'} m²
        </Tag>
      )}
      <AddressTag>
        {entry.adresse_numero}
        {entry.adresse_suffixe} {entry.adresse_nom_voie}
        <br />
        {entry.code_postal} {entry.nom_commune}
      </AddressTag>
    </div>
  </Popup>
)

export default MapMarker
