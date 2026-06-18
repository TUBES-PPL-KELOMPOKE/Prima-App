import {
    createPrescriptionController,
    getPrescriptionByIdController,
    updatePrescriptionByIdController,
    deletePrescriptionByIdController,
    getAllPrescriptionController,
    createItemsPrescriptionController,
    deleteItemsPrescriptionController,
    updateItemsPrescriptionController,
    downloadPrescriptionPdfController,
    getPrescriptionByPasienController
} 
from "../controller/prescription.controller.js";

export default async function prescriptionRoutes(app) {
    //post
    app.post('/create', createPrescriptionController);
    app.post('/create/items', createItemsPrescriptionController);
    app.get('/download/:id', downloadPrescriptionPdfController);

    //get
    app.get('/show/:id', getPrescriptionByIdController);
    app.get('/show/all', getAllPrescriptionController);
    app.get('/pasien/:pasien_id', getPrescriptionByPasienController);
    
    //put
    app.put('/update/:id', updatePrescriptionByIdController);
    app.put('/update/items/:id', updateItemsPrescriptionController);
    
    //delete
    app.delete('/delete/:id', deletePrescriptionByIdController);
    app.delete('/delete/items/:id', deleteItemsPrescriptionController);
}