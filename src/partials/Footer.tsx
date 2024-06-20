import Constants from '@/Data/Utilities/constants'
import { Link } from '@mui/material'

export default function Footer() {
    return <div className="pb-6 px-6 text-center">
        <p className="mb-0 fs-4">Design and Developed by
            <Link href="#" target="_blank"
                      className="pe-1 text-primary text-decoration-underline"> {Constants.AUTHOR.name}</Link> Distributed
            by <Link href="#"> ThemeWagon</Link></p>
    </div>
}
