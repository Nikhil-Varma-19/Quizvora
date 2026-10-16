import NavBar from "../../components/layout/NavBar/NavBar";
import Footer from "../../components/layout/Footer/Footer";
import Hero from "./sections/Hero/Hero";
import Modes from "./sections/Modes/Modes";
import HowItWorks from "./sections/HowItWorks/HowItWorks";
import CallToAction from "./sections/CallToAction/CallToAction";
import "./Landing.css";

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
