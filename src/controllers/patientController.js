const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Sequelize = require("sequelize");

module.exports = {
  async listAllPatients(req, res) {
    const patients = await Patient.findAll({
      patients: [["id", "ASC"]],
    }).catch((error) => {
      res.status(500).json({ msg: "Falha na conexão." });
    });
    if (patients)
      if (patients == "")
        res.status(404).json({ msg: "Não foi possível encontrar pacientes." });
      else res.status(200).json({ patients });
    else res.status(404).json({ msg: "Não foi possível encontrar pacientes." });
  },

  async searchPatientByName(req, res) {
    const name = req.body.name;
    if (!name)
      res.status(400).json({
        msg: "Parâmetro nome está vazio.",
      });
    const Op = Sequelize.Op;
    const patient = await Patient.findAll({
      where: { name: { [Op.like]: "%" + name + "%" } },
    });
    if (patient) {
      if (patient == "")
        res.status(404).json({ msg: "Paciente não encontrado" });
      else res.status(200).json({ patient });
    } else
      res.status(404).json({
        msg: "Paciente não encontrado.",
      });
  },

  async newPatient(req, res) {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      res.status(400).json({
        msg: "Dados obrigatórios não foram preenchidos.",
      });
    }

    //Procurar no BD por paciente já existente
    const isPatientNew = await Patient.findOne({
      where: { email },
    });

    if (isPatientNew)
      res.status(403).json({ msg: "Paciente já foi cadastrado." });
    else {
      const patient = await Patient.create({
        name,
        email,
        phone,
      }).catch((error) => {
        res.status(500).json({ msg: "Não foi possível inserir os dados." });
      });
      if (patient)
        res.status(201).json({ msg: "Novo paciente foi adicionado." });
      else
        res
          .status(404)
          .json({ msg: "Não foi possível cadastrar novo paciente." });
    }
  },

  async deletePatient(req, res) {
    const patientId = req.params.id;
    const deletedPatient = await Patient.destroy({
      where: { id: patientId },
    }).catch(async (error) => {
      const patientHasRef = await Appointment.findOne({
        where: { patientId },
      }).catch((error) => {
        res.status(500).json({ msg: "Falha na conexão." });
      });
      if (patientHasRef)
        return res
          .status(403)
          .json({ msg: "Paciente possui atendimentos em seu nome." });
    });
    if (deletedPatient != 0)
      res.status(200).json({ msg: "Paciente excluido com sucesso." });
    else res.status(404).json({ msg: "Paciente não encontrado." });
  },

  async updatePatient(req, res) {
    const patientId = req.body.id;
    const patient = req.body;
    if (!patientId) res.status(400).json({ msg: "ID do paciente vazio." });
    else {
      const patientExists = await Patient.findByPk(patientId);
      if (!patientExists)
        res.status(404).json({ msg: "Paciente não encontrado." });
      else {
        if (patient.name || patient.email) {
          await Patient.update(patient, {
            where: { id: patientId },
          });
          return res
            .status(200)
            .json({ msg: "Paciente atualizado com sucesso." });
        } else
          return res
            .status(400)
            .json({ msg: "Campos obrigatórios não preenchidos." });
      }
    }
  },
};
