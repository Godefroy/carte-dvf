import { Button, MenuItem, ProgressBar } from '@blueprintjs/core'
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select'
import React, { useState } from 'react'
import styled from 'styled-components'
import { departements, IDepartement } from '../config/departements'
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

const ProgressBarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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

const renderDepartement: ItemRenderer<IDepartement> = (
  departement,
  { handleClick, modifiers }
) =>
  !modifiers.matchesPredicate ? null : (
    <MenuItem
      key={departement.code}
      text={`${departement.code} - ${departement.nom}`}
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
    />
  )

const filterDepartement: ItemPredicate<IDepartement> = (
  query,
  departement,
  index,
  exactMatch
) => {
  const normalizedTitle = departement.nom.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  if (exactMatch) {
    return normalizedTitle === normalizedQuery
  } else {
    return (
      `${departement.code} ${normalizedTitle}`.indexOf(normalizedQuery) !== -1
    )
  }
}

const ConfigForm: React.FC<IProps> = ({ onSubmit }) => {
  const [year, setYear] = useState(settings.defaultConfig.year)
  const [departement, setDepartement] = useState<IDepartement>()
  const [loading, setLoading] = useState(false)

  return (
    <Panel>
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
      </Select>{' '}
      <Select
        items={departements}
        itemRenderer={renderDepartement}
        itemPredicate={filterDepartement}
        onItemSelect={d => setDepartement(d)}
        popoverProps={{
          minimal: true
        }}
      >
        <Button
          icon="map-marker"
          rightIcon="caret-down"
          text={
            departement
              ? `${departement.code} - ${departement.nom}`
              : 'Département'
          }
        />
      </Select>{' '}
      <Button
        onClick={async () => {
          if (!departement) return
          setLoading(true)
          await onSubmit(year, departement.code)
          setLoading(false)
        }}
      >
        Afficher
      </Button>
      {loading && (
        <ProgressBarContainer>
          <ProgressBar />
        </ProgressBarContainer>
      )}
    </Panel>
  )
}

export default ConfigForm
