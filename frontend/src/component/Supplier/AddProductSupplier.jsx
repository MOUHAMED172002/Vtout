import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../Admin/Product/AddProductModal';

const AddProductSupplier = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 min-h-screen">
            <AddProductModal
                isSupplier={true}
                layout="page"
                onClose={() => navigate('/fournisseur/dashboard')}
            />
        </div>
    );
};

export default AddProductSupplier;
