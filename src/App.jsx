import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from '@/context/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/modules/user/components/Login'
import Registro from '@/modules/user/components/Registro'
import MinhaConta from '@/modules/user/components/MinhaConta'
import Equipe from '@/modules/user/components/Equipe'
import VisaoGeral from '@/modules/servidor/components/VisaoGeral'
import ServidorPainel from '@/modules/servidor/components/ServidorPainel'
import Sites from '@/modules/site/components/Sites'
import Alertas from '@/modules/alerta/components/Alertas'
import AssinaturaPage from '@/modules/assinatura/components/AssinaturaPage'
import AssinaturaRetorno from '@/modules/assinatura/components/AssinaturaRetorno'
import Clientes from '@/modules/admin/components/Clientes'
import PlanosAdmin from '@/modules/admin/components/PlanosAdmin'
import Contratantes from '@/modules/contratante/components/Contratantes'
import PortalLogin from '@/modules/portal/components/PortalLogin'
import PortalAcesso from '@/modules/portal/components/PortalAcesso'
import PortalPainel from '@/modules/portal/components/PortalPainel'
import PortalRetorno from '@/modules/portal/components/PortalRetorno'

function Protegida({ papeis, children }) {
    return (
        <ProtectedRoute papeis={papeis}>
            <MainLayout>{children}</MainLayout>
        </ProtectedRoute>
    )
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Portal do cliente final (login e sessão próprios) */}
                    <Route path="/portal" element={<PortalPainel />} />
                    <Route path="/portal/login" element={<PortalLogin />} />
                    <Route path="/portal/acesso/:token" element={<PortalAcesso />} />
                    <Route path="/portal/retorno" element={<PortalRetorno />} />

                    <Route path="/inicio" element={<Protegida><VisaoGeral /></Protegida>} />
                    <Route path="/servidores/:id" element={<Protegida><ServidorPainel /></Protegida>} />
                    <Route path="/sites" element={<Protegida><Sites /></Protegida>} />
                    <Route path="/contratantes" element={<Protegida><Contratantes /></Protegida>} />
                    <Route path="/alertas" element={<Protegida><Alertas /></Protegida>} />
                    <Route path="/assinatura" element={<Protegida papeis={['admin']}><AssinaturaPage /></Protegida>} />
                    <Route path="/assinatura/retorno" element={<Protegida papeis={['admin']}><AssinaturaRetorno /></Protegida>} />
                    <Route path="/equipe" element={<Protegida papeis={['admin', 'membro']}><Equipe /></Protegida>} />
                    <Route path="/minha-conta" element={<Protegida><MinhaConta /></Protegida>} />
                    <Route path="/clientes" element={<Protegida papeis={['super_admin']}><Clientes /></Protegida>} />
                    <Route path="/planos" element={<Protegida papeis={['super_admin']}><PlanosAdmin /></Protegida>} />

                    <Route path="*" element={<Navigate to="/inicio" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}
