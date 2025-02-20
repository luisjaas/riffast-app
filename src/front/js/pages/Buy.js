import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Boleto } from "../component/Boleto.js";
import { Buttons } from "../component/Buttons.js";
import { VistaTickets } from "../component/VistaTickets.js";
import { BtnCompartir } from "../component/BtnCompartir";
import { Context } from "../store/appContext";
import { TalonarioFinalizado } from "../component/TalonarioFinalizado";

export const Buy = () => {
  const params = useParams();
  const [buySelect, setBuySelect] = useState("");
  const { store, actions } = useContext(Context);
  const [fullName, setFullName] = useState("");
  const [numeroTicket, setNumeroTicket] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoConsulta, setCorreoConsulta] = useState("");
  const [datosUser, setDatosUser] = useState([]);
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);

  useEffect(() => {
    actions.selectTalonario(params.talonario_id);
  }, []);

  useEffect(() => {
    if (store.talonarioSelect.constructor === Object) {
      actions.getTickets(store.talonarioSelect.id);
    }
  }, [store.talonarioSelect]);

  useEffect(() => {
    actions.numberFilter(store.ticketsReservados);
  }, [store.ticketsReservados]);

  useEffect(() => {
    actions.numberFilter(store.ticketsReservados);
  }, [store.ticketsReservados]);

  useEffect(() => {
    fetch(
      `${process.env.BACKEND_URL}/api/info-talonario/${store.talonarioSelect.id}`
    )
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        throw new Error("Algo salio mal");
      })
      .then((data) => {
        setDatosUser(data);
      })
      .catch((err) => console.error(err));
  }, [store.tokenUserTicket]);

  const sendData = async (e) => {
    e.preventDefault();
    if (fullName != "" && phone != "" && numeroTicket != "") {
      let buy = await actions.buyTickets(fullName, phone, email);
      if (buy != false) {
        let login = await actions.login_ticket(email, phone);
        if (login != false) {
          console.log(params.talonario_id);
          actions.crearTicket(numeroTicket, params.talonario_id);
          setBuySelect("revisar");
          setFullName("");
          setPhone("");
          setEmail("");
        }
      }
    }
  };

  const consultar = () => {
    actions.login_ticket(correoConsulta, correoConsulta);
    actions.getTickets(params.talonario_id);
    setCorreoConsulta("");
  };

  const reservarTicket = async () => {
    if (correo != "" && numeroTicket != "") {
      let login = await actions.login_ticket(correo, correo);
      if (login != false) {
        console.log(params.talonario_id);
        actions.crearTicket(numeroTicket, params.talonario_id);
        actions.getTickets(params.talonario_id);
        setBuySelect("revisar");
        setCorreo("");
      }
    }
  };

  return (
    <div className="min-vh-100 mb-5">
      {hoy.getTime() >
        new Date(store.talonarioSelect.fecha_sorteo).getTime() && (
        <TalonarioFinalizado />
      )}
      <Boleto talonario={store.talonarioSelect} />
      <BtnCompartir talonario={store.talonarioSelect} />
      <Buttons setBuySelect={setBuySelect} />

      {buySelect === "newbuy" ? (
        <>
          <div className="mt-5 signup form-reserva-ticket">
            <div className="form-group mb-2 select-ticket">
              <label className="form-label">Elige tu ticket</label>
              <select
                className="form-select mb-3 dropdown-ticket"
                aria-label="Default select example"
                value={numeroTicket}
                onChange={(event) => setNumeroTicket(event.target.value)}
              >
                <option>Selecciona tu número</option>
                {store.tickets.map((ticket) => {
                  if (ticket.status == "disponible") {
                    return (
                      <option key={`${ticket.numero} no`} value={ticket.numero}>
                        {ticket.numero}
                      </option>
                    );
                  }
                })}
              </select>
            </div>
            <h3 className="text-center">Completa tus datos</h3>
            <form onSubmit={sendData}>
              <div className="form-group mb-2">
                <label className="form-label fw-bold">Nombre Completo</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-control"
                  type="text"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div className="form-group mb-2 fw-bold">
                <label className="form-label">Teléfono</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  type="text"
                  placeholder="ej. 04241111111"
                />
              </div>

              <div className="form-group mb-3 fw-bold">
                <label className="form-label">Email (opcional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  type="email"
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="exampleCheck1"
                />
                <label className="form-check-label" htmlFor="exampleCheck1">
                  Acepto la Política de privacidad y Condiciones de uso
                </label>
              </div>
              <input
                className="btn  w-100 btn-reserva"
                type="submit"
                value="¡Reserva ya!"
              />
            </form>
          </div>
        </>
      ) : buySelect === "revisar" ? (
        <>
          <div className="d-flex justify-content-center mt-5">
            <div className="form-group m-2 select-ticket">
              <label className="form-label">
                Ingrese email o teléfono registrado en la rifa
              </label>
              <input
                className="form-control mb-3"
                aria-label="Default"
                value={correoConsulta}
                onChange={(event) => setCorreoConsulta(event.target.value)}
              />
              <button type="submit" className="btn login" onClick={consultar}>
                Consultar
              </button>
            </div>
          </div>
          {((store.tokenUserTicket &&
            store.tokenUserTicket !== "" &&
            store.tokenUserTicket !== undefined &&
            store.userTicketId !== null) ||
            store.userTicketId != null) && (
            <VistaTickets
              key={store.talonarioSelect.id}
              userData={datosUser}
              userID={store.userTicketId}
              tickets={store.ticketsReservados}
            />
          )}
        </>
      ) : (
        buySelect === "previousbuy" && (
          <div className="mt-5 signup form-reserva-ticket">
            <div className="form-group mb-2 select-ticket">
              <label className="form-label">Elige tu ticket</label>
              <select
                className="form-select mb-3 dropdown-ticket"
                aria-label="Default select example"
                value={numeroTicket}
                onChange={(event) => setNumeroTicket(event.target.value)}
              >
                {/* hacer un fecht a la base de base de datos para que salgan los tickets disponibles en este caso 100 tickets*/}
                <option>Selecciona tu número</option>
                {store.tickets.map((ticket) => {
                  if (ticket.status == "disponible") {
                    return (
                      <option key={`${ticket.numero} si`} value={ticket.numero}>
                        {ticket.numero}
                      </option>
                    );
                  }
                })}
              </select>

              <label className="form-label">
                Ingrese email o teléfono registrado anteriormente
              </label>
              <input
                className="form-control mb-3"
                aria-label="Default"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
              />

              <button
                type="submit"
                className="my-button rounded"
                onClick={reservarTicket}
              >
                ¡Reserva ya!
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
