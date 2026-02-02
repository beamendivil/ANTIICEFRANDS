import { useState, useMemo, type FormEvent } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Languages, 
  Info,
  Heart,
  Shield,
  Users,
  BookOpen,
  AlertCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  allies, 
  categories, 
  states, 
  type Ally, 
  type Category, 
  type State,
  getTucsonBusinesses,
  getTucsonOrganizations,
  getNationalOrganizations 
} from '@/data/allies';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedState, setSelectedState] = useState<State | 'All'>('All');
  const [selectedAlly, setSelectedAlly] = useState<Ally | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;
    if (!endpoint) {
      setSubmitStatus('error');
      setSubmitMessage('Form is not configured yet. Please try again later.');
      return;
    }
    setSubmitStatus('sending');
    setSubmitMessage('');
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const orgName = String(formData.get('orgName') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const website = String(formData.get('website') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const changes = String(formData.get('changes') || '').trim();
    const payload = new FormData();
    payload.append('name', name);
    payload.append('email', email);
    payload.append('orgName', orgName);
    payload.append('city', city);
    payload.append('state', state);
    payload.append('category', category);
    payload.append('website', website);
    payload.append('description', description);
    payload.append('changes', changes);
    payload.append('_subject', 'Directory update request');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: payload,
      });
      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.errors?.[0]?.message || 'Request failed.';
        throw new Error(errorMessage);
      }

      setSubmitStatus('success');
      setSubmitMessage('Thanks! Your update request was sent.');
      event.currentTarget.reset();
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  // Filter allies based on search and filters
  const filteredAllies = useMemo(() => {
    return allies.filter(ally => {
      const matchesSearch = searchQuery === '' || 
        ally.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ally.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ally.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ally.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || ally.category === selectedCategory;
      const matchesState = selectedState === 'All' || ally.state === selectedState;
      
      return matchesSearch && matchesCategory && matchesState;
    });
  }, [searchQuery, selectedCategory, selectedState]);

  // Stats
  const stats = useMemo(() => ({
    total: allies.length,
    tucsonBusinesses: getTucsonBusinesses().length,
    tucsonOrgs: getTucsonOrganizations().length,
    nationalOrgs: getNationalOrganizations().length,
  }), []);

  // Category colors
  const categoryColors: Record<string, string> = {
    'Legal Services': 'bg-blue-100 text-blue-800 border-blue-200',
    'Advocacy Organization': 'bg-purple-100 text-purple-800 border-purple-200',
    'Community Organization': 'bg-green-100 text-green-800 border-green-200',
    'Business': 'bg-orange-100 text-orange-800 border-orange-200',
    'Rapid Response': 'bg-red-100 text-red-800 border-red-200',
    'Educational Resource': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Healthcare': 'bg-pink-100 text-pink-800 border-pink-200',
    'Faith-Based': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">Anti-ICE Allies</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-red-600 font-medium">Home</button>
              <button onClick={() => scrollToSection('directory')} className="text-gray-700 hover:text-red-600 font-medium">Directory</button>
              <button onClick={() => scrollToSection('tucson')} className="text-gray-700 hover:text-red-600 font-medium">Tucson Allies</button>
              <button onClick={() => scrollToSection('resources')} className="text-gray-700 hover:text-red-600 font-medium">Resources</button>
              <button onClick={() => scrollToSection('submit')} className="text-gray-700 hover:text-red-600 font-medium">Submit Updates</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-red-600 font-medium">About</button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</button>
              <button onClick={() => scrollToSection('directory')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Directory</button>
              <button onClick={() => scrollToSection('tucson')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Tucson Allies</button>
              <button onClick={() => scrollToSection('resources')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Resources</button>
              <button onClick={() => scrollToSection('submit')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Submit Updates</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">About</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Anti-ICE Allies Directory
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              A comprehensive resource of organizations, legal services, and businesses 
              standing in solidarity with immigrant communities across the United States.
              A new initiative serving the Tucson, Arizona community and the 520 area.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => scrollToSection('directory')}
                className="bg-white text-red-700 hover:bg-red-50 font-semibold px-8 py-3 text-lg"
              >
                Find Allies
              </Button>
              <Button 
                onClick={() => scrollToSection('submit')}
                className="bg-red-900/30 text-white hover:bg-red-900/50 border border-white/40 font-semibold px-8 py-3 text-lg"
              >
                Submit an Update
              </Button>
              <Button 
                onClick={() => scrollToSection('tucson')}
                variant="outline"
                className="border-white text-white hover:bg-red-700 font-semibold px-8 py-3 text-lg"
              >
                Tucson Businesses
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold">{stats.total}+</div>
              <div className="text-red-100 text-sm md:text-base">Total Allies</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold">{stats.tucsonBusinesses}+</div>
              <div className="text-red-100 text-sm md:text-base">Tucson Businesses</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold">{stats.tucsonOrgs}</div>
              <div className="text-red-100 text-sm md:text-base">Tucson Organizations</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold">{stats.nationalOrgs}+</div>
              <div className="text-red-100 text-sm md:text-base">National Organizations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Updates Section */}
      <section id="submit" className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Submit Updates or New Listings
            </h2>
            <p className="text-lg text-gray-600">
              Help keep this directory accurate. Share corrections, new allies, or updates and we’ll review them.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <Input name="name" placeholder="Full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <Input name="email" type="email" placeholder="you@email.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization or Business</label>
                    <Input name="orgName" placeholder="Organization name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
                    <Input name="website" type="url" placeholder="https://" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <Input name="city" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <Input name="state" placeholder="State" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description (optional)</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="What services or support do they provide?"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Requested Changes</label>
                    <textarea
                      name="changes"
                      rows={5}
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Please describe the updates or new listing details."
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Submissions are sent directly to the directory team.
                  </p>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={submitStatus === 'sending'}
                    >
                      {submitStatus === 'sending' ? 'Sending...' : 'Submit Update'}
                    </Button>
                    {submitMessage && (
                      <p
                        className={`text-sm ${
                          submitStatus === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {submitMessage}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Resources Banner */}
      <section className="bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center flex-wrap gap-4 text-center">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Emergency: Report ICE activity in Tucson — Call/Text 
              <a href="tel:520-221-4077" className="underline font-bold ml-1">520-221-4077</a>
            </span>
            <span className="text-yellow-600 hidden sm:inline">|</span>
            <span className="text-yellow-800 font-medium">
              24/7 Family Support Hotline — 
              <a href="tel:855-435-7693" className="underline font-bold ml-1">1-855-HELP-MY-FAMILY</a>
            </span>
          </div>
        </div>
      </section>

      {/* Main Directory Section */}
      <section id="directory" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Anti-ICE Allies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search and filter through legal services, advocacy organizations, community groups, 
              and businesses supporting immigrant rights nationwide.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, service, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:w-auto flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {filtersOpen && (
              <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value as State | 'All')}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="All">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Showing {filteredAllies.length} result{filteredAllies.length !== 1 ? 's' : ''}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllies.map((ally) => (
              <Card 
                key={ally.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedAlly(ally)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{ally.name}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className={categoryColors[ally.category] || 'bg-gray-100'}>
                      {ally.category}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      {ally.state}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {ally.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {ally.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {ally.city}
                      </span>
                    )}
                    {ally.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Available
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAllies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tucson Section */}
      <section id="tucson" className="py-12 md:py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tucson Anti-ICE Allies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Highlighting local businesses and organizations in Tucson, Arizona that have 
              demonstrated solidarity with immigrant communities.
            </p>
          </div>

          {/* Tucson Organizations */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-600" />
              Tucson Organizations & Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTucsonOrganizations().slice(0, 6).map((ally) => (
                <Card 
                  key={ally.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
                  onClick={() => setSelectedAlly(ally)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{ally.name}</CardTitle>
                    <Badge variant="outline" className={categoryColors[ally.category] || 'bg-gray-100'}>
                      {ally.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {ally.description}
                    </p>
                    {ally.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {ally.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedState('Arizona');
                  setSelectedCategory('All');
                  scrollToSection('directory');
                }}
              >
                View All Tucson Organizations
              </Button>
            </div>
          </div>

          {/* Tucson Businesses */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-red-600" />
              Tucson Businesses (Closed Jan 30, 2026)
            </h3>
            <p className="text-gray-600 mb-6">
              These local businesses closed their doors on January 30, 2026 in solidarity with 
              the national anti-ICE protest, demonstrating their commitment to immigrant rights 
              and community solidarity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getTucsonBusinesses().map((business) => (
                <Card 
                  key={business.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                  onClick={() => setSelectedAlly(business)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{business.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{business.services[0]}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Know Your Rights Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Essential information and resources to help you understand and exercise your rights 
              during encounters with immigration enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Red Cards */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  Red Cards (Tarjetas Rojas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Printable cards that help you assert your constitutional rights during encounters 
                  with ICE. Available in 20+ languages.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://www.ilrc.org/community-resources/know-your-rights', '_blank')}
                >
                  Get Red Cards
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Know Your Rights */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Know Your Rights Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Comprehensive guides on your rights at home, at work, in public, and during 
                  ICE encounters. Available in multiple languages.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://immigrantjustice.org/for-immigrants/know-your-rights/ice-encounter/', '_blank')}
                >
                  View Guides
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Family Preparedness */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Family Preparedness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Create a family safety plan, designate emergency contacts, and prepare important 
                  documents in case of detention.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://www.informedimmigrant.com/guides/know-your-rights/', '_blank')}
                >
                  Learn More
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Legal Directory */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  National Legal Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Find free and low-cost immigration legal services providers in your area through 
                  the Immigration Advocates Network directory.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://www.immigrationadvocates.org/nonprofit/legaldirectory/', '_blank')}
                >
                  Find Legal Help
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Rapid Response */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Report ICE Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  If you see ICE activity in your community, report it to local rapid response 
                  networks. In Tucson: Call/Text 520-221-4077
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://www.rapidresponsetucson.com/', '_blank')}
                >
                  Tucson Rapid Response
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Detainee Locator */}
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-orange-600" />
                  Find a Detained Person
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Use ICE's online detainee locator system to find someone who has been detained 
                  by immigration enforcement.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://locator.ice.gov/odls/#/search', '_blank')}
                >
                  ICE Locator
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About This Directory
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Purpose</h3>
              <p className="text-gray-700">
                This directory was created to help immigrant communities and their allies find 
                resources, legal support, and businesses that stand in solidarity with their rights. 
                In times of increased immigration enforcement, knowing where to turn for help is 
                critical.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What You'll Find</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Legal Services:</strong> Free and low-cost immigration legal aid</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Advocacy Organizations:</strong> Groups fighting for immigrant rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Community Organizations:</strong> Local support networks and resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Business Allies:</strong> Businesses that support immigrant communities</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Disclaimer</h3>
              <p className="text-gray-700 text-sm">
                This directory is for informational purposes only. Inclusion in this list does not 
                constitute legal advice or endorsement. Please verify all information directly with 
                the organizations listed. For legal advice, consult with a qualified immigration attorney.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add or Update a Listing</h3>
              <p className="text-gray-700">
                If you know of an organization or business that should be included in this directory, 
                or if you need to update existing information, please contact us.
              </p>
              <div className="mt-4">
                <Button onClick={() => scrollToSection('submit')} className="bg-red-600 hover:bg-red-700">
                  Submit a Change
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-red-500" />
                <span className="text-xl font-bold text-white">Anti-ICE Allies</span>
              </div>
              <p className="text-sm text-gray-400">
                A comprehensive directory of organizations and businesses supporting 
                immigrant rights across the United States.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('directory')} className="hover:text-white">Directory</button></li>
                <li><button onClick={() => scrollToSection('tucson')} className="hover:text-white">Tucson Allies</button></li>
                <li><button onClick={() => scrollToSection('resources')} className="hover:text-white">Resources</button></li>
                <li><button onClick={() => scrollToSection('submit')} className="hover:text-white">Submit Updates</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white">About</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Emergency Contacts</h4>
              <ul className="space-y-2 text-sm">
                <li>Tucson Rapid Response: <a href="tel:520-221-4077" className="text-red-400 hover:text-red-300">520-221-4077</a></li>
                <li>Family Support Hotline: <a href="tel:855-435-7693" className="text-red-400 hover:text-red-300">1-855-HELP-MY-FAMILY</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© 2026 Anti-ICE Allies Directory. This is an informational resource for the community.</p>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <Dialog open={!!selectedAlly} onOpenChange={() => setSelectedAlly(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          {selectedAlly && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAlly.name}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={categoryColors[selectedAlly.category] || 'bg-gray-100'}>
                    {selectedAlly.category}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {selectedAlly.state}
                  </Badge>
                  {selectedAlly.city && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      {selectedAlly.city}
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">{selectedAlly.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlly.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedAlly.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                        <span className="text-gray-700">{selectedAlly.address}</span>
                      </div>
                    )}
                    {selectedAlly.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <a href={`tel:${selectedAlly.phone}`} className="text-red-600 hover:underline">
                          {selectedAlly.phone}
                        </a>
                      </div>
                    )}
                    {selectedAlly.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <a href={`mailto:${selectedAlly.email}`} className="text-red-600 hover:underline">
                          {selectedAlly.email}
                        </a>
                      </div>
                    )}
                    {selectedAlly.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <a 
                          href={selectedAlly.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                    {selectedAlly.hours && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{selectedAlly.hours}</span>
                      </div>
                    )}
                    {selectedAlly.languages && selectedAlly.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Languages className="h-5 w-5 text-gray-500 mt-0.5" />
                        <span className="text-gray-700">{selectedAlly.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {selectedAlly.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{selectedAlly.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedAlly.socialMedia && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                      <div className="flex gap-3">
                        {selectedAlly.socialMedia.facebook && (
                          <a 
                            href={`https://${selectedAlly.socialMedia.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Facebook
                          </a>
                        )}
                        {selectedAlly.socialMedia.instagram && (
                          <a 
                            href={`https://instagram.com/${selectedAlly.socialMedia.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline"
                          >
                            Instagram
                          </a>
                        )}
                        {selectedAlly.socialMedia.twitter && (
                          <a 
                            href={`https://twitter.com/${selectedAlly.socialMedia.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
