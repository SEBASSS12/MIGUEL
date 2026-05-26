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

async function listarMantenimientos() {

    const respuesta = await fetch("/mantenimientos");
    const mantenimientos = await respuesta.json();

    const lista = document.getElementById("listaMantenimientos");

    lista.innerHTML = "";

    mantenimientos.forEach(mantenimiento => {

        const fecha = mantenimiento.fecha
            ? mantenimiento.fecha.substring(0, 10)
            : "";

        lista.innerHTML += `
            <div class="usuario">

                <strong>${mantenimiento.tipo}</strong>
                <br>
                Vehículo: ${mantenimiento.placa_vehiculo}
                <br>
                Fecha: ${fecha}
                <br>
                Descripción: ${mantenimiento.descripcion || ""}
                <br>
                Estado: ${mantenimiento.estado}
                <br>
                Responsable: ${mantenimiento.responsable || ""}

                <div class="acciones">

                    <button onclick="editarMantenimiento(
                        ${mantenimiento.id},
                        '${mantenimiento.vehiculo_id}',
                        '${mantenimiento.tipo}',
                        '${fecha}',
                        '${mantenimiento.descripcion || ""}',
                        '${mantenimiento.estado}',
                        '${mantenimiento.responsable || ""}'
                    )">
                        Editar
                    </button>

                    <button onclick="eliminarMantenimiento(${mantenimiento.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;
    });
}

async function guardarMantenimiento() {

    const id = document.getElementById("id").value;
    const vehiculo_id = document.getElementById("vehiculo_id").value;
    const tipo = document.getElementById("tipo").value;
    const fecha = document.getElementById("fecha").value;
    const descripcion = document.getElementById("descripcion").value;
    const estado = document.getElementById("estado").value;
    const responsable = document.getElementById("responsable").value;
    const mensaje = document.getElementById("mensaje");

    if (vehiculo_id === "" || tipo === "" || fecha === "") {
        mensaje.innerText = "Vehículo, tipo y fecha son obligatorios";
        return;
    }

    const datos = {
        vehiculo_id,
        tipo,
        fecha,
        descripcion,
        estado,
        responsable
    };

    let url = "/mantenimientos";
    let metodo = "POST";

    if (id !== "") {
        url = "/mantenimientos/" + id;
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
    listarMantenimientos();
}

function editarMantenimiento(id, vehiculo_id, tipo, fecha, descripcion, estado, responsable) {

    document.getElementById("id").value = id;
    document.getElementById("vehiculo_id").value = vehiculo_id;
    document.getElementById("tipo").value = tipo;
    document.getElementById("fecha").value = fecha;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("estado").value = estado;
    document.getElementById("responsable").value = responsable;
}

async function eliminarMantenimiento(id) {

    const confirmar = confirm("¿Estás seguro de eliminar este mantenimiento?");

    if (!confirmar) {
        return;
    }

    const respuesta = await fetch("/mantenimientos/" + id, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();

    document.getElementById("mensaje").innerText = resultado.mensaje;

    listarMantenimientos();
}

function limpiarFormulario() {

    document.getElementById("id").value = "";
    document.getElementById("vehiculo_id").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("estado").value = "Pendiente";
    document.getElementById("responsable").value = "";
}

cargarVehiculos();
listarMantenimientos();