import axios from 'axios'
import csv from 'csvtojson'
import { IData } from './config/interfaces'

const fieldsToNumber = [
  'valeur_fonciere',
  'code_postal',
  'code_commune',
  'code_departement',
  'surface_reelle_bati',
  'surface_terrain',
  'longitude',
  'latitude'
]

export async function getData(
  year: number,
  departement: string
): Promise<IData[]> {
  const { data } = await axios.get(`/data/${year}/${departement}.csv`)
  const results = await csv().fromString(data)

  fieldsToNumber.forEach(field => {
    results.forEach(row => {
      row[field] = parseFloat(row[field]) || 0
    })
  })

  return results
}
