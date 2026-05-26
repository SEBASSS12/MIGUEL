async function cargarVehiculos() {

    const respuesta = await fetch("/vehiculos");
    const vehiculos = await respuesta.json();

    const select = document.getElementById("vehiculo_id");

    select.innerHTML = `<option value="">Seleccione un vehículo</option>`;

    vehiculos.forEach(vehiculo => {
        select.innerHTML += `
            <option value="${vehiculo.id}">
                ${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}
            </option>
        `;
    });
}

async function listarConductores() {

    const respuesta = await fetch("/conductores");
    const conductores = await respuesta.json();

    const lista = document.getElementById("listaConductores");

    lista.innerHTML = "";

    conductores.forEach(conductor => {

        lista.innerHTML += `
            <div class="usuario">

                <strong>${conductor.nombre}</strong>
                <br>
                Documento: ${conductor.documento}
                <br>
                Teléfono: ${conductor.telefono || ""}
                <br>
                Licencia: ${conductor.licencia || ""}
                <br>
                Vehículo: ${conductor.placa_vehiculo || "Sin asignar"}

                <div class="acciones">

                    <button onclick="editarConductor(
                        ${conductor.id},
                        '${conductor.nombre}',
                        '${conductor.documento}',
                        '${conductor.telefono || ""}',
                        '${conductor.licencia || ""}',
                        '${conductor.vehiculo_id || ""}'
                    )">
                        Editar
                    </button>

                    <button onclick="eliminarConductor(${conductor.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;
    });
}

async function guardarConductor() {

    const id = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const documento = document.getElementById("documento").value;
    const telefono = document.getElementById("telefono").value;
    const licencia = document.getElementById("licencia").value;
    const vehiculo_id = document.getElementById("vehiculo_id").value;
    const mensaje = document.getElementById("mensaje");

    if (nombre === "" || documento === "") {
        mensaje.innerText = "Nombre y documento son obligatorios";
        return;
    }

    const datos = {
        nombre,
        documento,
        telefono,
        licencia,
        vehiculo_id
    };

    let url = "/conductores";
    let metodo = "POST";

    if (id !== "") {
        url = "/conductores/" + id;
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
    listarConductores();
}

function editarConductor(id, nombre, documento, telefono, licencia, vehiculo_id) {

    document.getElementById("id").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("documento").value = documento;
    document.getElementById("telefono").value = telefono;
    document.getElementById("licencia").value = licencia;
    document.getElementById("vehiculo_id").value = vehiculo_id;
}

async function eliminarConductor(id) {

    const confirmar = confirm("¿Estás seguro de eliminar este conductor?");

    if (!confirmar) {
        return;
    }

    const respuesta = await fetch("/conductores/" + id, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();

    document.getElementById("mensaje").innerText = resultado.mensaje;

    listarConductores();
}

function limpiarFormulario() {

    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("documento").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("licencia").value = "";
    document.getElementById("vehiculo_id").value = "";
}

cargarVehiculos();
listarConductores();