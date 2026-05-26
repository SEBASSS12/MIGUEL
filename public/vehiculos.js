async function listarVehiculos() {

    const respuesta = await fetch("/vehiculos");
    const vehiculos = await respuesta.json();

    const lista = document.getElementById("listaVehiculos");

    lista.innerHTML = "";

    vehiculos.forEach(vehiculo => {

        lista.innerHTML += `
            <div class="usuario">

                <strong>${vehiculo.placa}</strong>
                <br>
                Marca: ${vehiculo.marca}
                <br>
                Modelo: ${vehiculo.modelo}
                <br>
                Color: ${vehiculo.color}
                <br>
                Estado: ${vehiculo.estado}

                <div class="acciones">

                    <button onclick="editarVehiculo(
                        ${vehiculo.id}, 
                        '${vehiculo.placa}', 
                        '${vehiculo.marca}', 
                        '${vehiculo.modelo}', 
                        '${vehiculo.color}', 
                        '${vehiculo.estado}'
                    )">
                        Editar
                    </button>

                    <button onclick="eliminarVehiculo(${vehiculo.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;

    });
}

async function guardarVehiculo() {

    const id = document.getElementById("id").value;
    const placa = document.getElementById("placa").value;
    const marca = document.getElementById("marca").value;
    const modelo = document.getElementById("modelo").value;
    const color = document.getElementById("color").value;
    const estado = document.getElementById("estado").value;
    const mensaje = document.getElementById("mensaje");

    if (placa === "" || marca === "" || modelo === "") {
        mensaje.innerText = "Placa, marca y modelo son obligatorios";
        return;
    }

    const datos = {
        placa,
        marca,
        modelo,
        color,
        estado
    };

    let url = "/vehiculos";
    let metodo = "POST";

    if (id !== "") {
        url = "/vehiculos/" + id;
        metodo = "PUT";
    }

    const respuesta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    mensaje.innerText = resultado.mensaje;

    limpiarFormulario();
    listarVehiculos();
}

function editarVehiculo(id, placa, marca, modelo, color, estado) {

    document.getElementById("id").value = id;
    document.getElementById("placa").value = placa;
    document.getElementById("marca").value = marca;
    document.getElementById("modelo").value = modelo;
    document.getElementById("color").value = color;
    document.getElementById("estado").value = estado;

}

async function eliminarVehiculo(id) {

    const confirmar = confirm("¿Estás seguro de eliminar este vehículo?");

    if (!confirmar) {
        return;
    }

    const respuesta = await fetch("/vehiculos/" + id, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();

    document.getElementById("mensaje").innerText = resultado.mensaje;

    listarVehiculos();
}

function limpiarFormulario() {

    document.getElementById("id").value = "";
    document.getElementById("placa").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("color").value = "";
    document.getElementById("estado").value = "Activo";

}

listarVehiculos();