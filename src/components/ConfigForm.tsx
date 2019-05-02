import { Button, FormGroup, MenuItem } from '@blueprintjs/core'
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select'
import React, { useState } from 'react'
import styled from 'styled-components'
import { departements } from '../config/departements'
import { years } from '../config/years'
import settings from '../settings'

const Panel = styled.div`
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
`

interface IProps {
  onSubmit: (year: number, departement: string) => Promise<void> | void
}

const renderYear: ItemRenderer<number> = (year, { handleClick, modifiers }) => (
  <MenuItem
    key={year}
    text={year.toString()}
    active={modifiers.active}
    disabled={modifiers.disabled}
    onClick={handleClick}
  />
)

const renderDepartement: ItemRenderer<string> = (
  departement,
  { handleClick, modifiers }
) =>
  !modifiers.matchesPredicate ? null : (
    <MenuItem
      key={departement}
      text={departement}
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
    />
  )

const filterDepartement: ItemPredicate<string> = (
  query,
  departement,
  index,
  exactMatch
) => {
  const normalizedTitle = departement.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  if (exactMatch) {
    return normalizedTitle === normalizedQuery
  } else {
    return normalizedTitle.indexOf(normalizedQuery) !== -1
  }
}

const ConfigForm: React.FC<IProps> = ({ onSubmit }) => {
  const [year, setYear] = useState(settings.defaultConfig.year)
  const [departement, setDepartement] = useState(
    settings.defaultConfig.departement
  )
  const [loading, setLoading] = useState(false)

  return (
    <Panel>
      <FormGroup inline label="Année">
        <Select
          items={years}
          filterable={false}
          itemRenderer={renderYear}
          onItemSelect={y => setYear(y)}
          popoverProps={{
            minimal: true
          }}
        >
          <Button icon="calendar" rightIcon="caret-down" text={year} />
        </Select>
      </FormGroup>

      <FormGroup inline label="Département">
        <Select
          items={departements}
          itemRenderer={renderDepartement}
          itemPredicate={filterDepartement}
          onItemSelect={d => setDepartement(d)}
          popoverProps={{
            minimal: true
          }}
        >
          <Button icon="map-marker" rightIcon="caret-down" text={departement} />
        </Select>
      </FormGroup>

      <Button
        onClick={async () => {
          setLoading(true)
          await onSubmit(year, departement)
          setLoading(false)
        }}
      >
        Afficher
      </Button>
      {loading && ' ⏳'}
    </Panel>
  )
}

export default ConfigForm
