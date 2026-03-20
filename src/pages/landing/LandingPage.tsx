import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  DollarSign,
  Users,
  Warehouse,
  Check,
  ArrowRight,
  Bot,
  Phone,
  Mail,
} from 'lucide-react'

const modules = [
  {
    icon: DollarSign,
    title: 'Cotizacion automatica',
    description:
      'Tu chatbot genera cotizaciones al instante con los precios de tu catalogo.',
  },
  {
    icon: MessageSquare,
    title: 'Cobranza inteligente',
    description:
      'Envio automatico de recordatorios de pago y seguimiento de cuentas por cobrar.',
  },
  {
    icon: Users,
    title: 'Prospeccion de clientes',
    description:
      'Captura datos de contacto y clasifica prospectos de forma automatica.',
  },
  {
    icon: Warehouse,
    title: 'Gestion de almacen',
    description:
      'Consulta de stock en tiempo real y alertas de inventario bajo.',
  },
]

const plans = [
  {
    name: 'Basico',
    price: '$499',
    period: 'MXN/mes',
    features: [
      '1 numero de WhatsApp',
      'Hasta 500 conversaciones/mes',
      'Catalogo de hasta 1,000 productos',
      'Cotizacion automatica',
      'Dashboard de metricas',
      'Soporte por email',
    ],
  },
  {
    name: 'Pro',
    price: '$999',
    period: 'MXN/mes',
    popular: true,
    features: [
      '3 numeros de WhatsApp',
      'Conversaciones ilimitadas',
      'Catalogo ilimitado',
      'Todos los modulos',
      'Integraciones con ERP',
      'Soporte prioritario 24/7',
      'Reportes avanzados',
    ],
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Battuta</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-600 hover:text-primary"
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Comenzar gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Bot size={16} />
            Potenciado con Inteligencia Artificial
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Automatiza las ventas de tu refaccionaria por WhatsApp con IA
          </h1>
          <p className="text-lg lg:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Configura un chatbot inteligente que atiende a tus clientes 24/7,
            genera cotizaciones y gestiona tu catalogo de autopartes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
            >
              Comenzar gratis
              <ArrowRight size={20} />
            </button>
            <a
              href="#modulos"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Ver modulos
            </a>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modulos" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            Todo lo que necesita tu refaccionaria
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Modulos disenados especificamente para el sector de autopartes.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <mod.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {mod.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            Planes y precios
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Sin contratos. Cancela cuando quieras.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-primary text-white shadow-xl shadow-primary/25'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-white text-xs font-bold px-3 py-1 rounded-full">
                    Mas popular
                  </span>
                )}
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`text-sm ${
                      plan.popular ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        size={16}
                        className={
                          plan.popular ? 'text-green-300' : 'text-success'
                        }
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-primary hover:bg-gray-100'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  Comenzar gratis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <span className="text-xl font-bold">Battuta</span>
              <p className="text-white/60 text-sm mt-2">
                Automatizacion inteligente para refaccionarias y distribuidoras
                de autopartes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Enlaces</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#modulos" className="hover:text-white">
                    Modulos
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white"
                  >
                    Iniciar sesion
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/register')}
                    className="hover:text-white"
                  >
                    Registrarse
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  +52 (55) 1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  hola@battuta.mx
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
            &copy; {new Date().getFullYear()} Battuta. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
