async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    if (email === "" || password === "") {
        mensaje.innerText = "Por favor completa todos los campos";
        return;
    }

    try {

        const respuesta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const resultado = await respuesta.json();

        if (resultado.estado === "ok") {

            window.location.href = "panel.html";

        } else {

            mensaje.innerText = resultado.mensaje;

        }

    } catch (error) {

        console.error("Error:", error);
        mensaje.innerText = "Error al iniciar sesión";

    }
}