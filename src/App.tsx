import './App.css'
import { MainLayout } from './components/Layout'
import { ShopProvider, useShop } from './hooks'
import { AdminPage } from './pages/AdminPage'
import { Landing } from './pages/Landing'

function AppRouter() {
    const { currentPath, user } = useShop()

    return (
        <MainLayout>
            {currentPath === '/admin' && user?.role === 'admin' ? <AdminPage /> : <Landing />}
        </MainLayout>
    )
}

function App() {
    return (
        <ShopProvider>
            <AppRouter />
        </ShopProvider>
    )
}

export default App
