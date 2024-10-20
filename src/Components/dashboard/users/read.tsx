import React, { useCallback, useEffect, useState } from 'react'
import Breadcrumd from '@/Components/Breadcrumd'
import InfoItem from '@/Components/InfoItem'
import UserAPI from '@/Data/Api/Users'
import { IUser } from '@/Data/Interfaces'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Grid, Skeleton } from '@mui/material'
import dayjs from 'dayjs'
import { setActivePage } from '@/Data/Slices/NavigationSlice'
import { Pages } from '@/Data/Objects/state'
import UtilMethods from '@/Data/Utilities/UtilMethods'
import Toast from '@/Data/Utilities/Toast'
import Constants from '@/Data/Utilities/constants'

const ReadUser = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton)
    const [record, setRecord] = useState<IUser | null>(null)
    const [inProgress, setInProgress] = useState(false)
    const { authorizations } = useAppSelector(state => state.userAuthorizing)
    const [isLoading, setIsLoading] = useState(true)
    const [reload, setReload] = useState(false)
    const dispatch = useAppDispatch()

    const getRecord = useCallback(async () => {
        try {
            setIsLoading(true)
            const { data } = await UserAPI.show(id)
            setRecord(data)
        } catch (e) {
            console.error(e.message)
        } finally {
            setIsLoading(false)
        }
    }, [id, reload])

    useEffect(() => {
        getRecord()
    }, [getRecord])

    const handleTreatAccountStatus = async () => {
        try {
            setInProgress(true)
            let actions = null
            if (record.status === 'active') {
                actions = UserAPI.disable
            } else {
                actions = UserAPI.reactivate
            }
            const { message } = await actions(id)
            setReload(prev => !prev)
            Toast.success(message)
        } catch (e) {
            console.error(e)
        } finally {
            setInProgress(false)
        }
    }

    const SkeletonLoader = () => (
        <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
                <Grid item xs={12} md={6} key={index}>
                    <Skeleton variant="rectangular" height={60} />
                </Grid>
            ))}
            <Grid item xs={12}>
                <Skeleton variant="rectangular" height={40} width={200} style={{ marginLeft: 'auto' }} />
            </Grid>
        </Grid>
    )

    return (
        <div className="container">
            <Breadcrumd parent="Users" url={currentPage} _child={id} />
            <div className='card'>
                <div className='card-body'>
                    {isLoading ? (
                        <SkeletonLoader />
                    ) : record ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6} lg={6} xl={6} className="__item-separator">
                                <InfoItem
                                    label="Last name"
                                    value={record.last_name}
                                    second={{
                                        label: `First name`,
                                        value: record.first_name,
                                    }}
                                />
                                <InfoItem
                                    label="Phone"
                                    value={record.phone}
                                    second={{
                                        label: `Email`,
                                        value: record.email,
                                    }}
                                />
                                <InfoItem
                                    label="Gender"
                                    value={record.gender}
                                    second={{
                                        label: `First connexion`,
                                        value: record.first_connexion ? 'Yes' : 'No',
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} lg={6} xl={6} className="">
                                <InfoItem
                                    label="Role(s)"
                                    value={
                                        record?.accesses?.map((access, index) => (
                                            <React.Fragment key={index}>
                                                {index > 0 && ' - '}
                                                <span className="mb-1 badge rounded-pill text-bg-light">
                                                    {access?.role?.label}
                                                </span>
                                            </React.Fragment>
                                        ))
                                    }
                                    second={{
                                        label: `Status`,
                                        value: <span className={`${UtilMethods.getStatus(record.status)}`}>{record.status}</span>,
                                    }}
                                />
                                <InfoItem
                                    label="Created At"
                                    value={`${dayjs(record.created_at).format('DD/MM/YYYY HH:mm:ss')}`}
                                    second={{
                                        label: `Updated At`,
                                        value: dayjs(record.updated_at).format('DD/MM/YYYY HH:mm:ss'),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} className="d-flex align-items-center justify-content-end">
                                <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                                    dispatch(setActivePage({
                                        page: Pages.ACCOUNT,
                                        id,
                                        param: {
                                            sub_page: 'UPDATE'
                                        }
                                    }))
                                }}>
                                    <i className='ti ti-pencil'></i>
                                    <span className='ms-1'>UPDATE</span>
                                </button>
                                {(UtilMethods.getHabilitations(authorizations, "account").canDisable && !UtilMethods.isAuth(id)) && <>
                                    {!inProgress ? <button className={`btn ms-2 d-flex align-items-center ${record.status === Constants.STATUS_ACCESS.ACTIVE ? 'btn-danger' : 'btn-success'}`} onClick={handleTreatAccountStatus}>
                                            <i className='ti ti-disabled-off'></i>
                                            <span className='ms-1'>{record.status === Constants.STATUS_ACCESS.ACTIVE ? 'DISABLE' : 'REACTIVATE'}</span>
                                        </button>
                                        :
                                        <button className="btn rounded-2" type="button" disabled>
                                            <span className="spinner-grow spinner-grow-sm ms-4" role="status" aria-hidden="true"></span>
                                            {record.status === Constants.STATUS_ACCESS.ACTIVE ? 'DISABLE...' : 'REACTIVATE...'}
                                        </button>
                                    }
                                </>}
                            </Grid>
                        </Grid>
                    ) : (
                        <p>No user data available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReadUser