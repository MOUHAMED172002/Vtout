
$p = 'c:\Users\Afiss\Documents\eshop\frontend\src\component\Admin\Fournisseurs\BoutiquesCatalogManager.jsx'
$c = Get-Content $p -Raw
$c = $c -replace 'const BoutiquesCatalogManager = \(\) => {', 'const BoutiquesCatalogManager = ({ globalSearchQuery = "" }) => {'
$c = $c -replace 'setLoading\] = useState\(true\);', 'setLoading] = useState(true); const [searchTerm, setSearchTerm] = useState("");'
$c = $c -replace 'const fetchBoutiques = async \(\) => {', 'const filteredBoutiques = boutiques.filter(b => { const query = (searchTerm || globalSearchQuery).toLowerCase(); return b.name?.toLowerCase().includes(query) || b.supplier?.name?.toLowerCase().includes(query); }); const fetchBoutiques = async () => {'
$c = $c -replace 'boutiques.map\(\(boutique\) => \(', 'filteredBoutiques.map((boutique) => ('

# Add Search to lucide-react imports if not there
if ($c -notmatch 'Search') {
    $c = $c -replace 'import { BarChart3 } from ''lucide-react'';', 'import { BarChart3, Search } from ''lucide-react'';'
}

# Add search bar to JSX
$searchBar = '
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Catalogue Boutiques</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gestion centralisǸe des points de vente</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher une boutique..."
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
'
$c = $c -replace '<div>\s+<h2 className=\"text-4xl font-black tracking-tighter text-slate-900 mb-2\">Catalogue Boutiques</h2>[\s\S]*?</div>', $searchBar

Set-Content $p $c -Encoding UTF8
