async function verificarSesion() {

    const respuesta = await fetch("/sesion");
    const resultado = await respuesta.json();

    if (resultado.estado === "ok") {

        document.getElementById("bienvenida").innerText =
            "Bienvenido " + resultado.usuario.nombre + " - Rol: " + resultado.usuario.rol;

        const fotoUsuario = document.getElementById("fotoUsuario");

        if (resultado.usuario.foto) {
            fotoUsuario.src = resultado.usuario.foto;
            fotoUsuario.style.display = "block";
        } else {
            fotoUsuario.style.display = "none";
        }

        controlarMenu(resultado.usuario.rol);

    } else {

        window.location.href = "login.html";

    }
}



function controlarMenu(rol) {

    const btnUsuarios = document.getElementById("btnUsuarios");
    const btnVehiculos = document.getElementById("btnVehiculos");
    const btnConductores = document.getElementById("btnConductores");
    const btnMantenimientos = document.getElementById("btnMantenimientos");

    btnUsuarios.style.display = "none";
    btnVehiculos.style.display = "none";
    btnConductores.style.display = "none";
    btnMantenimientos.style.display = "none";

    if (rol === "Administrador") {
        btnUsuarios.style.display = "block";
        btnVehiculos.style.display = "block";
        btnConductores.style.display = "block";
        btnMantenimientos.style.display = "block";
    }

    if (rol === "Jefe de mantenimiento") {
        btnVehiculos.style.display = "block";
        btnConductores.style.display = "block";
        btnMantenimientos.style.display = "block";
    }

    if (rol === "Conductor") {
        btnMantenimientos.style.display = "block";
    }

    if (rol === "Consulta") {
        btnVehiculos.style.display = "block";
        btnConductores.style.display = "block";
        btnMantenimientos.style.display = "block";
    }
}



async function cargarDashboard() {

    const respuesta = await fetch("/dashboard");
    const resultado = await respuesta.json();

    if (resultado.estado === "ok") {

        document.getElementById("totalUsuarios").innerText =
            resultado.datos.usuarios;

        document.getElementById("totalVehiculos").innerText =
            resultado.datos.vehiculos;

        document.getElementById("totalConductores").innerText =
            resultado.datos.conductores;

        document.getElementById("totalMantenimientos").innerText =
            resultado.datos.mantenimientos;

    }
}



async function cerrarSesion() {

    await fetch("/logout", {
        method: "POST"
    });

    window.location.href = "login.html";
}



verificarSesion();
cargarDashboard();