// components/AppSidebar.tsx
import { Link } from "react-router-dom"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Users, Gift, UserCircle, Receipt, PiggyBank, Home, CreditCard, Ticket, LogOut, Menu, X } from "lucide-react"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

// Navigation items grouped by category
const mainItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: Home,
  },
]

const referralItems = [
  {
    title: "Referrals",
    to: "/referrals",
    icon: Users,
  },
]

const appsItems = [
  {
    title: "Offers",
    to: "/offers",
    icon: Gift,
  },
]

const accountItems = [

  {
    title: "Payments",
    to: "/payments",
    icon: Receipt,
  },

  {
    title: "Crypto",
    to: "/crypto-payment",
    icon: CreditCard,

  },
  {
    title: "Withdraw",
    to: "/withdraw",
    icon: PiggyBank,
  },
]

export function AppSidebar() {
  const { logout } = useFirebaseUser()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-gray-800 text-white rounded-md shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar>
          <SidebarContent>
        {/* Main Navigation */}
        <div className="space-y-6">
          {/* Dashboard Section */}
          <nav className="space-y-1">
            {mainItems.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Referrals Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Referrals
            </h3>
            <nav className="mt-2 space-y-1">
              {referralItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Apps & Games Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Apps & Games
            </h3>
            <nav className="mt-2 space-y-1">
              {appsItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Account & Settings Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account & Settings
            </h3>
            <nav className="mt-2 space-y-1">
              {accountItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
      </div>
    </>
  )
}