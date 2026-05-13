
$p = 'c:\Users\Afiss\Documents\eshop\frontend\src\component\Admin\UserAdmin\UsersAdmin.jsx'
$c = Get-Content $p -Raw
$c = $c -replace 'export default function UsersAdmin\(\)', 'export default function UsersAdmin({ globalSearchQuery = "" })'
$c = $c -replace 'setSelectedUser\] = useState\(null\);', 'setSelectedUser] = useState(null); const [searchTerm, setSearchTerm] = useState("");'
$c = $c -replace 'const data = await getAllProfiles\(token\);', 'const data = await getAllProfiles(token);'
$c = $c -replace 'useEffect\(\(\) => {', 'const filteredUsers = users.filter(u => { const query = (searchTerm || globalSearchQuery).toLowerCase(); return u.email?.toLowerCase().includes(query) || u.first_name?.toLowerCase().includes(query) || u.last_name?.toLowerCase().includes(query) || u.phone?.includes(query); }); useEffect(() => {'

# Update the JSX to include a search bar
$searchBar = '
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur..."
            className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <UserTable users={filteredUsers} loading={loading} onView={(u) => setSelectedUser(u)} />
'
$c = $c -replace '<div className=\"space-y-4\">[\s\S]*?<UserTable users={users} loading={loading} onView={(u) => setSelectedUser(u)} />', $searchBar

Set-Content $p $c -Encoding UTF8
