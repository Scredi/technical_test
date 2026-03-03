import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { fetchApi } from '@/api/client'
import { Formality } from '@/types'

const typeLabels: Record<string, string> = {
  creation: 'Création',
  modification: 'Modification',
  'dépot des comptes': 'Dépôt des comptes',
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(d))
}

export function Dashboard() {
  const navigate = useNavigate()
  const { data: formalities, isLoading, error } = useQuery({
    queryKey: ['formalities'],
    queryFn: () => fetchApi<Formality[]>('/formalities'),
  })

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState('10')

  const [showCompany, setShowCompany] = useState(true)
  const [showType, setShowType] = useState(true)
  const [showOwner, setShowOwner] = useState(true)
  const [showStatus, setShowStatus] = useState(true)
  const [showCreation, setShowCreation] = useState(true)
  const [showModification, setShowModification] = useState(true)
  const [showAction, setShowAction] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [search, status, type, limit])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-destructive">Erreur: {error.message}</p>
      </div>
    )
  }

  const allRows = formalities || []

  const statuses: string[] = []
  for (let i = 0; i < allRows.length; i++) {
    if (statuses.indexOf(allRows[i].status) === -1) {
      statuses.push(allRows[i].status)
    }
  }

  const types: string[] = []
  for (let i = 0; i < allRows.length; i++) {
    if (types.indexOf(allRows[i].type) === -1) {
      types.push(allRows[i].type)
    }
  }

  const filtered = []
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]
    const q = search.toLowerCase().trim()
    const byCompany = row.company.toLowerCase().includes(q)
    const byOwner = `${row.owner.first_name} ${row.owner.last_name}`
      .toLowerCase()
      .includes(q)
    const byStatus = status === 'all' ? true : row.status === status
    const byType = type === 'all' ? true : row.type === type
    if ((byCompany || byOwner) && byStatus && byType) {
      filtered.push(row)
    }
  }

  const pageSize = Number(limit) || 10
  let totalPages = Math.ceil(filtered.length / pageSize)
  if (totalPages < 1) totalPages = 1
  if (page > totalPages) {
    setPage(totalPages)
  }

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const rows = filtered.slice(startIndex, endIndex)

  let visibleColumnCount = 0
  if (showCompany) visibleColumnCount++
  if (showType) visibleColumnCount++
  if (showOwner) visibleColumnCount++
  if (showStatus) visibleColumnCount++
  if (showCreation) visibleColumnCount++
  if (showModification) visibleColumnCount++
  if (showAction) visibleColumnCount++

  const shownStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const shownEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Liste des formalités. Cliquez sur une ligne pour voir le détail.
        </p>
      </div>

      <div className="rounded-md border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher"
          />

          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(v) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {typeLabels[t] || t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={limit} onValueChange={(v) => setLimit(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 lignes</SelectItem>
                <SelectItem value="10">10 lignes</SelectItem>
                <SelectItem value="20">20 lignes</SelectItem>
                <SelectItem value="50">50 lignes</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Colonnes</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Colonnes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showCompany}
                  onCheckedChange={(v) => setShowCompany(v === true)}
                >
                  Société
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showType}
                  onCheckedChange={(v) => setShowType(v === true)}
                >
                  Type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showOwner}
                  onCheckedChange={(v) => setShowOwner(v === true)}
                >
                  Responsable
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showStatus}
                  onCheckedChange={(v) => setShowStatus(v === true)}
                >
                  Statut
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showCreation}
                  onCheckedChange={(v) => setShowCreation(v === true)}
                >
                  Création
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showModification}
                  onCheckedChange={(v) => setShowModification(v === true)}
                >
                  Modification
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showAction}
                  onCheckedChange={(v) => setShowAction(v === true)}
                >
                  Action
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {showCompany ? <TableHead>Société</TableHead> : null}
              {showType ? <TableHead>Type</TableHead> : null}
              {showOwner ? <TableHead>Responsable</TableHead> : null}
              {showStatus ? <TableHead>Statut</TableHead> : null}
              {showCreation ? <TableHead>Création</TableHead> : null}
              {showModification ? <TableHead>Modification</TableHead> : null}
              {showAction ? <TableHead className="w-[80px]"></TableHead> : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleColumnCount === 0 ? (
              <TableRow>
                <TableCell colSpan={1}>Aucune colonne affichée</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-muted-foreground py-8"
                  colSpan={visibleColumnCount}
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.uuid}>
                  {showCompany ? (
                    <TableCell className="font-medium">{row.company}</TableCell>
                  ) : null}

                  {showType ? (
                    <TableCell>
                      <Badge variant="secondary">
                        {typeLabels[row.type] || row.type}
                      </Badge>
                    </TableCell>
                  ) : null}

                  {showOwner ? (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {row.owner.first_name[0]}
                            {row.owner.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {row.owner.first_name} {row.owner.last_name}
                        </span>
                      </div>
                    </TableCell>
                  ) : null}

                  {showStatus ? (
                    <TableCell>
                      {row.status === 'Validé' ? (
                        <Badge variant="default">{row.status}</Badge>
                      ) : row.status === 'Refusé' ? (
                        <Badge variant="destructive">{row.status}</Badge>
                      ) : (
                        <Badge variant="outline">{row.status}</Badge>
                      )}
                    </TableCell>
                  ) : null}

                  {showCreation ? (
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(row.creation_date)}
                    </TableCell>
                  ) : null}

                  {showModification ? (
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(row.modification_date)}
                    </TableCell>
                  ) : null}

                  {showAction ? (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/dashboard/formalities/' + row.uuid)}
                      >
                        Détail
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {shownStart}-{shownEnd} sur {filtered.length}
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={page === p}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
                className={
                  page >= totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}