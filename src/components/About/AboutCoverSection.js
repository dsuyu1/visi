import Image from 'next/image'
import React from 'react'
import logo from "../../../public/logo.png"

const AboutCoverSection = () => {
  return (
    <section className='w-full md:h-[75vh] flex flex-col md:flex-row items-center justify-center text-dark dark:text-light'>
        <div className='w-full md:w-1/2 h-full flex justify-center items-center p-8'>
            <Image src={logo} alt="Vaquero Information Security Initiative"
            className='w-3/5 xs:w-1/2 md:w-4/5 h-full object-contain object-center'
            priority
            sizes="(max-width: 768px) 100vw,(max-width: 1180px) 50vw, 50vw"
            />
        </div>

        <div className='w-full md:w-1/2 flex flex-col text-left items-start justify-center px-5 xs:p-10 pb-10 lg:px-16'>
            <h2 className='font-bold text-4xl xs:text-5xl sxl:text-6xl  text-center lg:text-left'>
            We&rsquo;re a community-first cyber group
            </h2>
            <p className='font-in font-medium mt-6 text-base'>
            The Vaquero Information Security Initiative (VISI) is a cybersecurity student organization and 501(c)(3) nonprofit based in the Rio Grande Valley. We were founded to address the challenges our region faces in cybersecurity, and our goal is to build the skills to help.
            </p>
            <p className='font-in font-medium mt-4 text-base'>
            Students who join build applicable real-world skills alongside passionate, like-minded individuals. VISI serves as a network and a springboard for students launching careers in cybersecurity, while giving back to our communities through workshops, open resources, and other contributions.
            </p>
        </div>
    </section>
  )
}

export default AboutCoverSection
