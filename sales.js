document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();

    document.getElementById('saveSale').addEventListener('click', function() {
        saveSale();
    });

    function saveSale() {
        const factureId = document.getElementById('factureId').value;
        const paymentMethod = document.getElementById('paymentmeth').value;
        const totalGdes = parseFloat(document.querySelector('.totalGdes').value.trim());
        const sellerName = document.getElementById('sellerName').value;
        const consumedTableBody = document.getElementById('consumedTableBody');

        if (!factureId || !paymentMethod || isNaN(totalGdes) || !sellerName) {
            alert("Veuillez remplir tous les champs obligatoires correctement.");
            return;
        }

        const newSale = {
            factureId,
            date: document.getElementById('date').value,
            paymentMethod,
            totalGdes,
            sellerName,
            products: []
        };

        const rows = consumedTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.getElementsByTagName('td');
            const item = cells[0].textContent.trim();
            const quantityInput = cells[1].querySelector('input');
            const quantity = parseInt(quantityInput.value.trim(), 10);
            const price = parseFloat(cells[2].textContent.trim());

            if (!isNaN(quantity) && !isNaN(price)) {
                newSale.products.push({ item, quantity, price });
            }
        });

        if (newSale.products.length === 0) {
            alert("Ajoutez au moins un produit avant de sauvegarder la vente.");
            return;
        }

        db.collection("sales").doc(factureId).get()
            .then((doc) => {
                if (doc.exists) {
                    updateSaleAndAdjustQuantities(doc.data(), newSale);
                } else {
                    addNewSaleAndAdjustQuantities(newSale);
                }
            })
            .catch((error) => {
                console.error("Erreur lors de la vérification de la facture :", error);
            });
    }

    function addNewSaleAndAdjustQuantities(newSale) {
        const batch = db.batch();
        let insufficientStock = false;

        const productFetchPromises = newSale.products.map(saleProduct => {
            return db.collection("products").where("name", "==", saleProduct.item).limit(1).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        const productDoc = querySnapshot.docs[0];
                        const productData = productDoc.data();
                        const newQuantity = productData.quantity - saleProduct.quantity;

                        if (newQuantity < 0) {
                            insufficientStock = true;
                            alert(`Stock insuffisant pour le produit : ${saleProduct.item}`);
                            return null;
                        }

                        return { ref: productDoc.ref, newQuantity };
                    } else {
                        alert(`Produit introuvable : ${saleProduct.item}`);
                        insufficientStock = true;
                        return null;
                    }
                });
        });

        Promise.all(productFetchPromises).then(results => {
            if (insufficientStock) {
                console.log("Vente annulée : stock insuffisant.");
                return;
            }

            results.forEach(result => {
                if (result !== null) {
                    batch.update(result.ref, { quantity: result.newQuantity });
                }
            });

            const saleRef = db.collection("sales").doc(newSale.factureId);
            batch.set(saleRef, newSale);

            return batch.commit().then(() => {
                console.log("Vente enregistrée.");
                window.location.href = 'sales.html';
            }).catch(error => {
                console.error("Erreur lors de l'enregistrement de la vente :", error);
                alert("Erreur : " + error);
            });
        }).catch(error => {
            console.error("Erreur lors de la récupération des produits :", error);
        });
    }

    function updateSaleAndAdjustQuantities(existingSale, newSale) {
        const batch = db.batch();
        let insufficientStock = false;
        const productQuantities = {};

        const productNames = [...new Set([...existingSale.products, ...newSale.products].map(p => p.item))];

        const productFetchPromises = productNames.map(itemName => {
            return db.collection("products").where("name", "==", itemName).limit(1).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        const productDoc = querySnapshot.docs[0];
                        const product = productDoc.data();

                        const existingProduct = existingSale.products.find(p => p.item === itemName);
                        const newProduct = newSale.products.find(p => p.item === itemName);

                        const previousQty = existingProduct ? existingProduct.quantity : 0;
                        const newQty = newProduct ? newProduct.quantity : 0;

                        const updatedStock = product.quantity + previousQty - newQty;

                        if (updatedStock < 0) {
                            alert(`Stock insuffisant pour le produit : ${itemName}`);
                            insufficientStock = true;
                            return null;
                        }

                        productQuantities[itemName] = {
                            ref: productDoc.ref,
                            quantity: updatedStock
                        };
                    } else {
                        alert(`Produit introuvable : ${itemName}`);
                        insufficientStock = true;
                    }
                }).catch(error => {
                    console.error("Erreur récupération produit :", error);
                });
        });

        Promise.all(productFetchPromises).then(() => {
            if (insufficientStock) {
                console.log("Mise à jour annulée : stock insuffisant.");
                return;
            }

            for (const item in productQuantities) {
                batch.update(productQuantities[item].ref, {
                    quantity: productQuantities[item].quantity
                });
            }

            const saleRef = db.collection("sales").doc(newSale.factureId);
            batch.set(saleRef, newSale);

            return batch.commit().then(() => {
                console.log("Vente mise à jour.");
                window.location.href = 'sales.html';
            }).catch(error => {
                console.error("Erreur mise à jour vente :", error);
                alert("Erreur : " + error);
            });
        });
    }
});
