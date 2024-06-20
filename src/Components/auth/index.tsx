import Login from '@/pages/auth/Login'
import Forgot from '@/pages/auth/Forgot'
import Reset from '@/pages/auth/Reset'
import { Fragment } from 'react'
import { Pages } from '@/Data/Objects/state'
import { useAppSelector } from '@/hooks'

export default function AuthPages() {
  const {currentPage: page} = useAppSelector((state) => state.navigaton)

    const renderAuthPage = () => {
      if(page === Pages.FORGOT_PAGE){
        return <Forgot />
      }

      if(page === Pages.RESET_PAGE){
        return <Reset />
      }

      if(page === Pages.LOGIN){
        return <Login />
      }
    }

  return (
    <Fragment>
      {renderAuthPage()}
    </Fragment>
  )
}
