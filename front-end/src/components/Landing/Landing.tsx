import CallToAction from "../../pages/Landing/sections/CallToAction/CallToAction";
import Hero from "../../pages/Landing/sections/Hero/Hero";
import HowItWorks from "../../pages/Landing/sections/HowItWorks/HowItWorks";
import Modes from "../../pages/Landing/sections/Modes/Modes";
import Footer from "../layout/Footer/Footer";
import NavBar from "../layout/NavBar/NavBar";


export default function Landing() {
	return (
		<>
			<NavBar />
			<main className="landing">
				<Hero />
				<Modes />
				<HowItWorks />
				<CallToAction />
			</main>
			<Footer />
		</>
	)
}
