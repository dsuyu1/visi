import Image from "next/image"
import Link from "next/link"
import logo from "@/public/logo.png"
import siteMetadata from "@/src/utils/siteMetaData"

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-dark dark:text-light">
        <div className=" w-12 md:w-16 rounded-full overflow-hidden border border-solid border-dark dark:border-gray  mr-2 md:mr-4">
            <Image src={logo} alt="VISI logo" className="w-full h-auto rounded-full" sizes="20vw" priority />
        </div>
        <span className="font-bold dark:font-semibold text-lg md:text-xl">{siteMetadata.headerTitle}</span>
    </Link>
  )
}

export default Logo
