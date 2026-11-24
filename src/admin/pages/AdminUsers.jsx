import { useState, useEffect } from 'react'
import { Search, Filter, Shield, User, Mail, ShieldCheck, Loader2, ChevronLeft, ChevronRight, MoreVertical, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { getDocs, collection, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [lastQuery, setLastQuery] = useState({ search: '', roleFilter: '' })

  const fetchUsers = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setUsers([])
      setLastDoc(null)
      setHasMore(true)
      setLastQuery({ search: '', roleFilter: '' })
    } else {
      setLoadingMore(true)
    }

    try {
      let q = collection(db, 'users')
      const constraints = []

      if (search.trim()) {
        constraints.push(where('displayName', '>=', search))
        constraints.push(where('displayName', '<=', search + ''))
      }

      if (roleFilter) {
        constraints.push(where('role', '==', roleFilter))
      }

      constraints.push(orderBy('createdAt', 'desc'))

      if (lastDoc && !reset) {
        constraints.push(startAfter(lastDoc))
      }

      if (constraints.length > 1) {
        q = query(q, ...constraints.filter(c => c.type !== 'orderBy'))
      } else {
        q = query(q, orderBy('createdAt', 'desc'))
      }

      if (reset && search.trim() && roleFilter) {
        q = query(collection(db, 'users'), orderBy('displayName'), limit(20))
      }

      const snapshot = await getDocs(q)
      const newUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }))
      setUsers(prev => reset ? newUsers : [...prev, ...newUsers])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1])
      setHasMore(snapshot.docs.length === 20)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setLastQuery({ search, roleFilter })
    }
  }

  const handleSearch = (e) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    if (!resetSearch) {
      fetchUsers(true)
    }
  }

  const [resetSearch, setResetSearch] = useState(false)

  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    if (role) {
      fetchUsers(true)
    } else {
      fetchUsers(true)
    }
  }

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      })
      toast.success(`Role updated to ${newRole}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  useEffect(() => {
    fetchUsers(true)
  }, [])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(false)
    }
  }

  const roleConfig = {
    admin: { label: 'Admin', color: 'badge-danger', icon: ShieldCheck },
    customer: { label: 'Customer', color: 'badge', icon: User },
    merchant: { label: 'Merchant', color: 'badge-primary', icon: Shield }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2">Users</h1>
          <button className="btn-primary" disabled>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-primary-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-2/3" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-dark-100 rounded w-1/4" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-dark-100 rounded w-20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2">Users</h1>
          <p className="text-body text-dark-500 mt-1">Manage user accounts and permissions ({users.length} users)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search users by name or email..."
            className="input pl-12"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(true); }}
          className="input w-auto py-2"
        >
          <option value="">All Roles</option>
          {Object.entries(roleConfig).map(([role, config]) => (
            <option key={role} value={role}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-primary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-dark-500">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark-950">{user.displayName || 'No Name'}</p>
                          <p className="text-xs text-dark-500 truncate max-w-xs">{user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark-950 text-sm">{user.email}</p>
                      {user.emailVerified === false && (
                        <p className="text-xs text-yellow-600">Not verified</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RoleSelector
                        userId={user.id}
                        currentRole={user.role || 'customer'}
                        onRoleChange={handleRoleUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="btn-ghost p-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="px-6 py-4 border-t border-dark-100">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-outline w-full"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Users'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Role Selector Component
function RoleSelector({ userId, currentRole, onRoleChange }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const roles = [
    { value: 'customer', label: 'Customer', icon: User, color: 'badge' },
    { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'badge-danger' },
    { value: 'merchant', label: 'Merchant', icon: Shield, color: 'badge-primary' }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`badge ${roles.find(r => r.value === currentRole)?.color || 'badge'}`}
      >
        {roles.find(r => r.value === currentRole)?.label || currentRole}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-dark-100 min-w-[160px] py-1">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <button
                  key={role.value}
                  onClick={() => { onRoleChange(userId, role.value); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-primary-50 flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{role.label}</span>
                  {role.value === currentRole && <Check className="w-4 h-4 text-primary-500 ml-auto" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { format } from 'date-fns'
import { ChevronDown, Check } from 'lucide-react'

export default AdminUsers