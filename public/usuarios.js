async function guardarUsuario() {

    const id = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
    const foto = document.getElementById("foto").files[0];

    if (nombre === "" || email === "") {
        alert("Nombre y email son obligatorios");
        return;
    }

    const datos = new FormData();

    datos.append("nombre", nombre);
    datos.append("email", email);
    datos.append("password", password);
    datos.append("rol", rol);

    if (foto) {
        datos.append("foto", foto);
    }

    let url = "/usuarios";
    let metodo = "POST";

    if (id !== "") {
        url = `/usuarios/${id}`;
        metodo = "PUT";
    }

    const respuesta = await fetch(url, {
        method: metodo,
        body: datos
    });

    const resultado = await respuesta.json();

    alert(resultado.mensaje);

    limpiarFormulario();

    listarUsuarios();
}

async function listarUsuarios() {

    const respuesta = await fetch("/usuarios");

    const usuarios = await respuesta.json();

    const lista = document.getElementById("listaUsuarios");

    lista.innerHTML = "";

    usuarios.forEach(usuario => {

        lista.innerHTML += `

            <div class="usuario">

              ${usuario.foto ? `<img src="${usuario.foto}" class="foto-perfil">` : ""}

                <strong>${usuario.nombre}</strong>
                <br>

                ${usuario.email}
                <br>

                Rol: ${usuario.rol || "Sin rol"}

                <div class="acciones">

                    <button onclick="editarUsuario(${usuario.id}, '${usuario.nombre}', '${usuario.email}', '${usuario.rol || "Consulta"}')">
                        Editar
                    </button>

                    <button onclick="eliminarUsuario(${usuario.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;

    });
}



async function eliminarUsuario(id) {

    const confirmar = confirm("¿Estás seguro de eliminar este usuario?");

    if (!confirmar) {
        return;
    }

    const respuesta = await fetch(`/usuarios/${id}`, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();

    alert(resultado.mensaje);

    listarUsuarios();
}



function editarUsuario(id, nombre, email, rol) {

    document.getElementById("id").value = id;

    document.getElementById("nombre").value = nombre;

    document.getElementById("email").value = email;

    document.getElementById("password").value = "";

    document.getElementById("rol").value = rol;
}



function limpiarFormulario() {

    document.getElementById("id").value = "";

    document.getElementById("nombre").value = "";

    document.getElementById("email").value = "";

    document.getElementById("password").value = "";

    document.getElementById("rol").value = "Administrador";
}



listarUsuarios();


async function eliminarUsuario(id) {

    const confirmar = confirm("¿Estás seguro de eliminar este usuario?");

    if (!confirmar) {
        return;
    }

    const respuesta = await fetch(`/usuarios/${id}`, {
        method: "DELETE"
    });

    const resultado = await respuesta.json();

    alert(resultado.mensaje);

    listarUsuarios();
}



function editarUsuario(id, nombre, email) {

    document.getElementById("id").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("email").value = email;
    document.getElementById("password").value = "";

}



function limpiarFormulario() {

    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

}



listarUsuarios();