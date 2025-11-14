import Header from "@/app/components/layout/Header";
import HomeDetails from "./components/(feature)/home/HomeDetails";
import Footer from "@/app/components/layout/Footer";
import DefaultBackground from "@/app/components/ui/background/DefaultBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <DefaultBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="md:backdrop-blur-xl md:bg-background-50/10 md:dark:bg-background-50/10 md:border-x md:border-border-50 flex-1 container lg:max-w-6xl md:max-w-5xl sm:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <HomeDetails />
        </main>
        <Footer />
      </div>
    </div>
  );
}
