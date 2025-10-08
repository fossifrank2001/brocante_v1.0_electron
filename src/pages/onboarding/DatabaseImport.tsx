"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import axiosInstance from "@/Data/Utilities/axiosInstance"

const DatabaseImport: React.FC = () => {
    const [useExistingDb, setUseExistingDb] = useState<boolean | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [importProgress, setImportProgress] = useState(0)
    const [importStatus, setImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState<string>("")

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0])
        }
    }

    const handleImport = async () => {
        if (!file) return

        setImportStatus("importing")
        setImportProgress(0)
        const formData = new FormData()
        formData.append("database", file)

        try {
            await axiosInstance.post("/import-database", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setImportProgress(percentCompleted)
                },
            })
            setImportStatus("success")
        } catch (error) {
            console.error("Error importing database:", error)
            setImportStatus("error")
            setErrorMessage(error.response?.data?.message || "An error occurred during import.")
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {useExistingDb === null ? (
                <div className="text-center">
                    <p className="mb-3">Do you want to use an existing database?</p>
                    <div className="d-flex justify-content-center gap-3">
                        <motion.button
                            className="btn btn-outline-primary"
                            onClick={() => setUseExistingDb(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Yes
                        </motion.button>
                        <motion.button
                            className="btn btn-outline-secondary"
                            onClick={() => setUseExistingDb(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            No
                        </motion.button>
                    </div>
                </div>
            ) : useExistingDb ? (
                <div>
                    <input type="file" accept=".sql, .sqlite" onChange={handleFileChange} className="form-control mb-3" />
                    {file && (
                        <motion.button
                            className="btn btn-primary w-100"
                            onClick={handleImport}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={importStatus === "importing"}
                        >
                            {importStatus === "importing" ? "Importing..." : "Import Database"}
                        </motion.button>
                    )}
                    {importStatus === "importing" && (
                        <motion.div className="progress mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <motion.div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${importProgress}%` }}
                                animate={{ width: `${importProgress}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 10 }}
                            >
                                {importProgress}%
                            </motion.div>
                        </motion.div>
                    )}
                    {importStatus === "success" && (
                        <motion.div
                            className="alert alert-success mt-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Database imported successfully!
                        </motion.div>
                    )}
                    {importStatus === "error" && (
                        <motion.div
                            className="alert alert-danger mt-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Error importing the database: {errorMessage}
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="alert alert-info">A new database will be created for you.</div>
            )}
        </motion.div>
    )
}

export default DatabaseImport
