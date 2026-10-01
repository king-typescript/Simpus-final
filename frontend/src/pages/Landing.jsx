import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import Features from '../components/Features.jsx'
import PopularBooks from '../components/PopularBooks.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <PopularBooks />
      </main>
      <Footer />
    </div>
  )
}
