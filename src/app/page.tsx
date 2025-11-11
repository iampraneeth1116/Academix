"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Academix | School Admin Dashboard</title>
        <meta
          name="description"
          content="Academix is a powerful School Management Dashboard built with Next.js and Tailwind CSS — designed for modern schools to manage students, teachers, and administration efficiently."
        />
        <meta
          name="keywords"
          content="Academix, School Management System, Next.js School Dashboard, Education Software, School ERP, Tailwind CSS, Admin Panel"
        />
      </Head>

      <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800">
        <header className="flex justify-between items-center px-6 sm:px-12 py-4 border-b border-gray-200 bg-white/70 backdrop-blur-lg sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Academix
          </h1>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all duration-200"
          >
            Login
          </button>
        </header>

        <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-12 py-20 md:py-28 max-w-7xl mx-auto w-full">
          <div className="max-w-xl text-center md:text-left mt-10 md:mt-0">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
              Streamline Your School with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Academix
              </span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
              A next-generation{" "}
              <strong>School Admin Dashboard</strong> built using{" "}
              <span className="font-medium text-gray-800">Next.js</span> and{" "}
              <span className="font-medium text-gray-800">Tailwind CSS</span>.
              Academix empowers administrators, teachers, and students to
              collaborate efficiently with modern tools and a delightful UI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md"
              >
                Get Started
              </button>
              <button
                onClick={() =>
                  window.scrollTo({ top: 800, behavior: "smooth" })
                }
                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-1/2 flex justify-center mb-12 md:mb-0 px-4">
            <div className="absolute -top-20 -right-32 w-[35rem] h-[35rem] bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="relative bg-white/90 border border-gray-200 shadow-2xl rounded-3xl overflow-hidden max-w-2xl w-full transform hover:scale-[1.03] transition-all duration-500">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <Image
                width={1200}
                height={700}
                src="/academix.png"
                alt="Academix School Management Dashboard preview"
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-12 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-gray-800">Academix</span>?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-base sm:text-lg">
              Academix simplifies the way schools operate — offering a
              centralized system for managing academics, communication, and
              administration efficiently.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                  🎓 Unified Management
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Streamline students, teachers, attendance, and academics in
                  one connected platform.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                  ⚡ Built for Speed
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Powered by Next.js and Tailwind CSS for a blazing-fast,
                  modern, and responsive experience.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                  📈 Insightful Analytics
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gain data-driven insights with clean visual dashboards for
                  smarter decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-900 text-white text-center py-20 px-6 sm:px-12">
          <h3 className="text-3xl sm:text-4xl font-semibold mb-4">
            Ready to Transform Your School?
          </h3>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of educators and administrators using Academix to
            manage their schools more effectively.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300"
          >
            Get Started with Academix
          </button>
        </section>

        <footer className="text-center text-gray-500 text-sm py-6 border-t border-gray-200 bg-gray-50">
          <p>
            © {new Date().getFullYear()} <strong>Academix</strong> — School
            Management Dashboard | Built with ❤️ using Next.js & Tailwind CSS
          </p>
        </footer>
      </main>
    </>
  );
}
