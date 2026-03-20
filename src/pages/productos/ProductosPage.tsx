import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Upload, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Product } from '../../types'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  category: z.string().min(1, 'La categoria es obligatoria'),
  price: z.number().min(0, 'El precio debe ser positivo'),
  stock: z.number().int().min(0, 'El stock debe ser positivo'),
})

type ProductForm = z.infer<typeof productSchema>

const ITEMS_PER_PAGE = 10

const categories = [
  'Todas',
  'Motor',
  'Frenos',
  'Suspension',
  'Electrico',
  'Transmision',
  'Carroceria',
  'Aceites',
  'Filtros',
]

export function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [page, setPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await apiFetch<Product[]>('/api/products')
      setProducts(data)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => {
    setEditingProduct(null)
    reset({ name: '', sku: '', category: '', price: 0, stock: 0 })
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: ProductForm) => {
    try {
      if (editingProduct) {
        await apiFetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }
      setModalOpen(false)
      loadProducts()
    } catch {
      /* empty */
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Eliminar este producto?')) return
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
      loadProducts()
    } catch {
      /* empty */
    }
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await apiFetch('/api/products/import', {
        method: 'POST',
        headers: {},
        body: formData,
      })
      loadProducts()
    } catch {
      /* empty */
    }
    e.target.value = ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} />
            Importar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            <Plus size={16} />
            Agregar producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Categoria</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Precio</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Stock</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No hay productos
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{p.sku}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right">
                      ${p.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      <span className={p.stock < 5 ? 'text-red-500 font-medium' : 'text-gray-900'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 ml-1">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {filtered.length} productos
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  {...register('sku')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {categories.filter((c) => c !== 'Todas').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
