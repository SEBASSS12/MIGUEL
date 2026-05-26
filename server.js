const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db");

const app = express();
const PORT = 3000;

const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        const nombreArchivo = Date.now() + path.extname(file.originalname);
        cb(null, nombreArchivo);
    }
});

const upload = multer({ storage: storage });

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// SESIONES
app.use(session({
    secret: "vehiculos",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

// RUTA PRINCIPAL
app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

// ===============================
// LISTAR USUARIOS
// ===============================
app.get("/usuarios", (req, res) => {

    const sql = "SELECT id, nombre, email, rol, foto FROM usuarios ORDER BY id DESC";

    db.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);
            res.json({
                mensaje: "Error al listar usuarios"
            });
        } else {
            res.json(resultados);
        }
    });
});

// ===============================
// GUARDAR USUARIO
// ===============================
app.post("/usuarios", upload.single("foto"), async (req, res) => {

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
        return res.json({
            mensaje: "Nombre, email y contraseña son obligatorios"
        });
    }

    const foto = req.file ? "/uploads/" + req.file.filename : null;

    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO usuarios(nombre, email, password, rol, foto)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, email, passwordHash, rol || "Consulta", foto], (error) => {

        if (error) {
            console.log(error);
            res.json({
                mensaje: "Error al guardar usuario"
            });
        } else {
            res.json({
                mensaje: "Usuario guardado correctamente"
            });
        }
    });
});

// ===============================
// ACTUALIZAR USUARIO
// ===============================
app.put("/usuarios/:id", async (req, res) => {

    const id = req.params.id;
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email) {
        return res.json({
            mensaje: "Nombre y email son obligatorios"
        });
    }

    if (password && password.trim() !== "") {

        const passwordHash = await bcrypt.hash(password, 10);

        const sql = `
            UPDATE usuarios
            SET nombre = ?, email = ?, password = ?, rol = ?
            WHERE id = ?
        `;

        db.query(sql, [nombre, email, passwordHash, rol || "Consulta", id], (error) => {

            if (error) {
                console.log(error);
                res.json({
                    mensaje: "Error al actualizar usuario"
                });
            } else {
                res.json({
                    mensaje: "Usuario actualizado correctamente"
                });
            }
        });

    } else {

        const sql = `
            UPDATE usuarios
            SET nombre = ?, email = ?, rol = ?
            WHERE id = ?
        `;

        db.query(sql, [nombre, email, rol || "Consulta", id], (error) => {

            if (error) {
                console.log(error);
                res.json({
                    mensaje: "Error al actualizar usuario"
                });
            } else {
                res.json({
                    mensaje: "Usuario actualizado correctamente"
                });
            }
        });
    }
});

// ===============================
// ELIMINAR USUARIO
// ===============================
app.delete("/usuarios/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM usuarios WHERE id = ?";

    db.query(sql, [id], (error) => {

        if (error) {
            console.log(error);
            res.json({
                mensaje: "Error al eliminar usuario"
            });
        } else {
            res.json({
                mensaje: "Usuario eliminado correctamente"
            });
        }
    });
});

// ===============================
// LOGIN
// ===============================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (error, resultados) => {

        if (error) {
            console.log(error);

            return res.json({
                estado: "error",
                mensaje: "Error servidor"
            });
        }

        if (resultados.length === 0) {
            return res.json({
                estado: "error",
                mensaje: "Usuario no encontrado"
            });
        }

        const usuario = resultados[0];

        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.json({
                estado: "error",
                mensaje: "Contraseña incorrecta"
            });
        }

        req.session.usuario = {
         id: usuario.id,
        nombre: usuario.nombre,
         email: usuario.email,
        rol: usuario.rol || "Consulta",
        foto: usuario.foto
};

        res.json({
            estado: "ok",
            mensaje: "Login correcto"
        });
    });
});

// ===============================
// VERIFICAR SESIÓN
// ===============================
app.get("/sesion", (req, res) => {

    if (req.session.usuario) {

        res.json({
            estado: "ok",
            usuario: req.session.usuario
        });

    } else {

        res.json({
            estado: "error"
        });
    }
});

// ===============================
// CERRAR SESIÓN
// ===============================
app.post("/logout", (req, res) => {

    req.session.destroy();

    res.json({
        estado: "ok"
    });
});

// ===============================
// CREAR TABLA VEHICULOS
// ===============================
const crearTablaVehiculos = `
    CREATE TABLE IF NOT EXISTS vehiculos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        placa VARCHAR(20) NOT NULL,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        color VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'Activo',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(crearTablaVehiculos, (error) => {
    if (error) {
        console.log("Error al crear tabla vehiculos:", error);
    } else {
        console.log("Tabla vehiculos lista");
    }
});

// ===============================
// LISTAR VEHICULOS
// ===============================
app.get("/vehiculos", (req, res) => {

    const sql = "SELECT * FROM vehiculos ORDER BY id DESC";

    db.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);
            res.json([]);
        } else {
            res.json(resultados);
        }
    });
});

// ===============================
// REGISTRAR VEHICULO
// ===============================
app.post("/vehiculos", (req, res) => {

    const { placa, marca, modelo, color, estado } = req.body;

    const sql = `
        INSERT INTO vehiculos 
        (placa, marca, modelo, color, estado) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [placa, marca, modelo, color, estado], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al registrar vehículo"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Vehículo registrado correctamente"
            });
        }
    });
});

// ===============================
// EDITAR VEHICULO
// ===============================
app.put("/vehiculos/:id", (req, res) => {

    const { id } = req.params;
    const { placa, marca, modelo, color, estado } = req.body;

    const sql = `
        UPDATE vehiculos 
        SET placa = ?, marca = ?, modelo = ?, color = ?, estado = ?
        WHERE id = ?
    `;

    db.query(sql, [placa, marca, modelo, color, estado, id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al actualizar vehículo"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Vehículo actualizado correctamente"
            });
        }
    });
});

// ===============================
// ELIMINAR VEHICULO
// ===============================
app.delete("/vehiculos/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM vehiculos WHERE id = ?";

    db.query(sql, [id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al eliminar vehículo"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Vehículo eliminado correctamente"
            });
        }
    });
});

// ===============================
// CREAR TABLA CONDUCTORES
// ===============================
const crearTablaConductores = `
    CREATE TABLE IF NOT EXISTS conductores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        documento VARCHAR(50) NOT NULL,
        telefono VARCHAR(50),
        licencia VARCHAR(100),
        vehiculo_id INT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
        ON DELETE SET NULL
    )
`;

db.query(crearTablaConductores, (error) => {
    if (error) {
        console.log("Error al crear tabla conductores:", error);
    } else {
        console.log("Tabla conductores lista");
    }
});

// ===============================
// LISTAR CONDUCTORES
// ===============================
app.get("/conductores", (req, res) => {

    const sql = `
        SELECT 
            conductores.id,
            conductores.nombre,
            conductores.documento,
            conductores.telefono,
            conductores.licencia,
            conductores.vehiculo_id,
            vehiculos.placa AS placa_vehiculo
        FROM conductores
        LEFT JOIN vehiculos ON conductores.vehiculo_id = vehiculos.id
        ORDER BY conductores.id DESC
    `;

    db.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);
            res.json([]);
        } else {
            res.json(resultados);
        }
    });
});

// ===============================
// REGISTRAR CONDUCTOR
// ===============================
app.post("/conductores", (req, res) => {

    const { nombre, documento, telefono, licencia, vehiculo_id } = req.body;

    const sql = `
        INSERT INTO conductores 
        (nombre, documento, telefono, licencia, vehiculo_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, documento, telefono, licencia, vehiculo_id || null], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al registrar conductor"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Conductor registrado correctamente"
            });
        }
    });
});

// ===============================
// EDITAR CONDUCTOR
// ===============================
app.put("/conductores/:id", (req, res) => {

    const { id } = req.params;
    const { nombre, documento, telefono, licencia, vehiculo_id } = req.body;

    const sql = `
        UPDATE conductores
        SET nombre = ?, documento = ?, telefono = ?, licencia = ?, vehiculo_id = ?
        WHERE id = ?
    `;

    db.query(sql, [nombre, documento, telefono, licencia, vehiculo_id || null, id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al actualizar conductor"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Conductor actualizado correctamente"
            });
        }
    });
});

// ===============================
// ELIMINAR CONDUCTOR
// ===============================
app.delete("/conductores/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM conductores WHERE id = ?";

    db.query(sql, [id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al eliminar conductor"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Conductor eliminado correctamente"
            });
        }
    });
});

// ===============================
// CREAR TABLA MANTENIMIENTOS
// ===============================
const crearTablaMantenimientos = `
    CREATE TABLE IF NOT EXISTS mantenimientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehiculo_id INT NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL,
        descripcion TEXT,
        estado VARCHAR(50) DEFAULT 'Pendiente',
        responsable VARCHAR(100),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
        ON DELETE CASCADE
    )
`;

db.query(crearTablaMantenimientos, (error) => {
    if (error) {
        console.log("Error al crear tabla mantenimientos:", error);
    } else {
        console.log("Tabla mantenimientos lista");
    }
});

// ===============================
// LISTAR MANTENIMIENTOS
// ===============================
app.get("/mantenimientos", (req, res) => {

    const sql = `
        SELECT 
            mantenimientos.id,
            mantenimientos.vehiculo_id,
            mantenimientos.tipo,
            mantenimientos.fecha,
            mantenimientos.descripcion,
            mantenimientos.estado,
            mantenimientos.responsable,
            vehiculos.placa AS placa_vehiculo
        FROM mantenimientos
        INNER JOIN vehiculos ON mantenimientos.vehiculo_id = vehiculos.id
        ORDER BY mantenimientos.id DESC
    `;

    db.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);
            res.json([]);
        } else {
            res.json(resultados);
        }
    });
});

// ===============================
// REGISTRAR MANTENIMIENTO
// ===============================
app.post("/mantenimientos", (req, res) => {

    const { vehiculo_id, tipo, fecha, descripcion, estado, responsable } = req.body;

    const sql = `
        INSERT INTO mantenimientos
        (vehiculo_id, tipo, fecha, descripcion, estado, responsable)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [vehiculo_id, tipo, fecha, descripcion, estado, responsable], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al registrar mantenimiento"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Mantenimiento registrado correctamente"
            });
        }
    });
});

// ===============================
// EDITAR MANTENIMIENTO
// ===============================
app.put("/mantenimientos/:id", (req, res) => {

    const { id } = req.params;
    const { vehiculo_id, tipo, fecha, descripcion, estado, responsable } = req.body;

    const sql = `
        UPDATE mantenimientos
        SET vehiculo_id = ?, tipo = ?, fecha = ?, descripcion = ?, estado = ?, responsable = ?
        WHERE id = ?
    `;

    db.query(sql, [vehiculo_id, tipo, fecha, descripcion, estado, responsable, id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al actualizar mantenimiento"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Mantenimiento actualizado correctamente"
            });
        }
    });
});

// ===============================
// ELIMINAR MANTENIMIENTO
// ===============================
app.delete("/mantenimientos/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM mantenimientos WHERE id = ?";

    db.query(sql, [id], (error) => {

        if (error) {
            console.log(error);

            res.json({
                estado: "error",
                mensaje: "Error al eliminar mantenimiento"
            });

        } else {

            res.json({
                estado: "ok",
                mensaje: "Mantenimiento eliminado correctamente"
            });
        }
    });
});

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", (req, res) => {

    const datos = {};

    db.query("SELECT COUNT(*) AS total FROM usuarios", (error, resultadoUsuarios) => {

        if (error) {
            console.log(error);
            return res.json({
                estado: "error",
                mensaje: "Error al consultar usuarios"
            });
        }

        datos.usuarios = resultadoUsuarios[0].total;

        db.query("SELECT COUNT(*) AS total FROM vehiculos", (error, resultadoVehiculos) => {

            if (error) {
                console.log(error);
                return res.json({
                    estado: "error",
                    mensaje: "Error al consultar vehículos"
                });
            }

            datos.vehiculos = resultadoVehiculos[0].total;

            db.query("SELECT COUNT(*) AS total FROM conductores", (error, resultadoConductores) => {

                if (error) {
                    console.log(error);
                    return res.json({
                        estado: "error",
                        mensaje: "Error al consultar conductores"
                    });
                }

                datos.conductores = resultadoConductores[0].total;

                db.query("SELECT COUNT(*) AS total FROM mantenimientos", (error, resultadoMantenimientos) => {

                    if (error) {
                        console.log(error);
                        return res.json({
                            estado: "error",
                            mensaje: "Error al consultar mantenimientos"
                        });
                    }

                    datos.mantenimientos = resultadoMantenimientos[0].total;

                    res.json({
                        estado: "ok",
                        datos
                    });
                });
            });
        });
    });
});

// ===============================
// INICIAR SERVIDOR
// ===============================
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});