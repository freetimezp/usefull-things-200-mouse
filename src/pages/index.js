import styles from "@/styles/Home.module.css";
import Image from "next/image";

import TrailContainer from "@/components/TrailContainer";

export default function Home() {
    return (
        <>
            <section className="hero">
                <div className="hero-img">
                    <Image src="/images/bg.jpg" alt="" fill style={{ objectFit: "cover" }} />{" "}
                </div>

                <p>oh try this one animation</p>

                <p>@freetime. 2025.</p>

                <TrailContainer />
            </section>
        </>
    );
}
