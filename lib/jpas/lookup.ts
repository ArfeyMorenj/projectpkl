import { bankMaster, clientsMaster, coaMaster, installationItemsMaster, invoiceTypesMaster, productsMaster, teamMaster } from "./master-data"

export function findClientByCode(code: string) {
  return clientsMaster.find((item) => item.code === code)
}

export function findProductByCode(code: string) {
  return productsMaster.find((item) => item.code === code)
}

export function findTeamByCode(code: string) {
  return teamMaster.find((item) => item.code === code)
}

export function findInstallationItemByCode(code: string) {
  return installationItemsMaster.find((item) => item.code === code)
}

export function findBankByCode(code: string) {
  return bankMaster.find((item) => item.code === code)
}

export function findInvoiceTypeByCode(code: string) {
  return invoiceTypesMaster.find((item) => item.code === code)
}

export function findCoaByCode(code: string) {
  return coaMaster.find((item) => item.code === code)
}
