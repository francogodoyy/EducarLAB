import React, { useState, useEffect} from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Autocomplete, Grid, Switch, Typography} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Calendario from './Calendario';
import Horario from './Horario';
import axios from 'axios';

const EducacionForm = () => {
    const [formData, setFormData] = useState({
        cue: '',
        nombreEscuela: '',
        localidadEscuela: '',
        nombreDirector: '',
        grado: '',
        turno: 'Mañana',
        cantAlumnos: '',
        telefono: '',
        email: '',
        fechaVisita: '',
        horario: '',
        estado: 'ACTIVADO',
    });

    const [errores, setErrores] = useState({});
    const [calendarioOpen, setCalendarioOpen] = useState(false);
    const [horarioOpen, setHorarioOpen] = useState(false);
    const [mostrarHorarioInput, setMostrarHorarioInput] = useState(false);
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [cueData, setCueData] = useState([]);
    const [filteredCueData, setFilteredCueData] = useState([]);
    const [descargaWord, setDescargaWord] = useState(false)

    useEffect(() => {
        fetchCueData();
    }, []);

    const handleDescarga = ()=>{
      const link = document.createElement("a");
      link.href = "/public/AUTORIZACION DE USO Y CESIÓN DE IMAGEN Y VOZ DE MENORES- ConectarLAB Chaco.docx";
      link.download = 'AUTORIZACION DE USO Y CESIÓN DE IMAGEN Y VOZ DE MENORES';
      link.click();
      setDescargaWord(true)
    }
    
    const fetchCueData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/cue');
            setCueData(response.data);
            setFilteredCueData(response.data);
        } catch (error) {
            console.error('Error fetching CUE data:', error);
        }
    };

    const normalizeString = (str) => {
        console.log('Input to normalizeString:', str, typeof str);
        return str
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos.
            .replace(/[^a-z0-9\s]/g, '') // quita caracteres especiales.
            .replace(/\s+/g, ' ') // reemplaza multiples espacios con solo un espacio.
            .trim(); // quita espacios al principio y al final.
    };

    const handleCueInputChange = (event, value) => {
        const inputCue = value;
        const filtered = cueData.filter(item =>{
            const normalizedNombreEscuela = normalizeString(item.nombre_escuela);
            const normalizedCue = normalizeString(item.id_cue);
            const normalizedLocalidad = normalizeString(item.localidad);
            
            return normalizedNombreEscuela.includes(inputCue) ||
                   normalizedCue.includes(inputCue) ||
                   normalizedLocalidad.includes(inputCue);
        });
        setFilteredCueData(filtered);
        setFormData(prev => ({ ...prev, cue: value }));
    };

    const handleCueSelect = (event, value) => {
        if (value) {
            setFormData(prev => ({
                ...prev,
                cue: value.id_cue,
                nombreEscuela: value.nombre_escuela,
                localidadEscuela: value.localidad
            }));
        }
    };


    
    const validarCampo = (name, value) => {
        let error = '';
        switch (name) {
            case 'cue':
                if (!/^\d+$/.test(value) || value.length < 1) error = 'CUE debe ser un número válido';
                break;
            case 'cantAlumnos':
                if (value < 1 || value > 25) error = 'Para turnos de más de 25 alumnos, comunicarse por correo.';
                break;
                case 'telefono':
                    if (!/^\+?[\d\s()-]{7,}$/.test(value)) error = 'Teléfono debe ser un número válido';
                    break;
            case 'email':
                if (!/\S+@\S+\.\S+/.test(value)) error = 'Email inválido';
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validarCampo(name, value);
        setErrores(prev => ({ ...prev, [name]: error }));
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = async (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, fechaVisita: formattedDate }));
        try {
            const response = await axios.get(`http://localhost:3000/horarios/ocupados?fechaVisita=${formattedDate}`);
            setHorariosOcupados(response.data.ocupados);
        } catch (error) {
            console.error('Error al trear los horarios ocupados:', error);
        }
        setHorarioOpen(true);
    };

    const handleHorarioChange = (horario) => {
        setFormData(prev => ({ ...prev, horario }));
        setMostrarHorarioInput(true);
        setHorarioOpen(false);
    };

    const handleHorarioInputClick = () => {
        formData.fechaVisita ? setHorarioOpen(true) : setCalendarioOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        if (!formData.horario) {
            alert('Por favor, seleccione un horario');
            return;
        }else if(!descargaWord){
          alert('Por favor, descargue el formulario de autorizacion de imagen a traves del boton: "Descargar Formulario"')
          return;
        }
        

        const formErrores = Object.keys(formData).reduce((acc, key) => {

            const error = validarCampo(key, formData[key]);
            if (error) acc[key] = error;
            return acc;
        }, {});

        if (Object.keys(formErrores).length > 0) {
            setErrores(formErrores);
            alert('Por favor, corrija los errores antes de enviar el formulario.');
            return;
        }

        try {
            await axios.post("http://localhost:3000/post", formData);
            alert('El turno se agregó');
            setFormData({
                cue: '',
                nombreEscuela: '',
                localidadEscuela: '',
                nombreDirector: '',
                grado: '',
                turno: 'Mañana',
                cantAlumnos: '',
                telefono: '',
                email: '',
                fechaVisita: '',
                horario: '',
                estado: 'ACTIVADO',
            });
            setMostrarHorarioInput(false);
            setErrores({});
        } catch (error) {
            console.error('Error al enviar el formulario', error);
            alert('Error al cargar. Por favor, intente nuevamente.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} mt={2}>
              <Autocomplete
                options={filteredCueData}
                getOptionLabel={(option) => `${option.id_cue} - ${option.nombre_escuela}`}
                renderInput={(params) => <TextField {...params} label="CUE" variant="outlined" fullWidth />}
                onInputChange={handleCueInputChange}
                onChange={handleCueSelect}
                isOptionEqualToValue={(option, value) => option.id_cue === value.id_cue}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <div>{option.id_cue} - {option.nombre_escuela}</div>
                      <div style={{fontSize: '0.8em', color: 'gray'}}>{option.localidad}</div>
                    </li>
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre de la Escuela"
                variant="outlined"
                fullWidth
                name="nombreEscuela"
                value={formData.nombreEscuela}
                onChange={handleChange}
                InputProps={{ readOnly: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Localidad de la Escuela"
                variant="outlined"
                fullWidth
                name="localidadEscuela"
                value={formData.localidadEscuela}
                onChange={handleChange}
                InputProps={{ readOnly: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre del Director"
                variant="outlined"
                fullWidth
                name="nombreDirector"
                value={formData.nombreDirector}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Grado"
                variant="outlined"
                fullWidth
                name="grado"
                value={formData.grado}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="turno-label">Turno</InputLabel>
                <Select
                  labelId="turno-label"
                  id="turno"
                  value={formData.turno}
                  onChange={handleChange}
                  label="Turno"
                  name="turno"
                >
                  <MenuItem value="Mañana">Mañana</MenuItem>
                  <MenuItem value="Tarde">Tarde</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantidad de Alumnos"
                variant="outlined"
                fullWidth
                name="cantAlumnos"
                type="number"
                value={formData.cantAlumnos}
                onChange={handleChange}
                error={!!errores.cantAlumnos}
                helperText={errores.cantAlumnos}
                InputProps={{inputProps: { min: 1, max: 25 }}}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono"
                variant="outlined"
                fullWidth
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                error={!!errores.telefono}
                helperText={errores.telefono}
                required
                inputProps={{
                  pattern: "^\\+?[\\d\\s()-]{7,}$",
                  title: "Ingrese un número de teléfono válido"
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errores.email}
                helperText={errores.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Fecha de la Visita"
                variant="outlined"
                fullWidth
                name="fechaVisita"
                value={formData.fechaVisita}
                onClick={() => setCalendarioOpen(true)}
                InputProps={{ readOnly: true }}
                required
              />
            </Grid>
            {mostrarHorarioInput && (
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Horario Seleccionado"
                  variant="outlined"
                  fullWidth
                  name="horario"
                  value={formData.horario}
                  onClick={handleHorarioInputClick}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} alignItems="center">
              <FormControlLabel 
                control={<Checkbox required />} 
                label="Acepto los términos y condiciones de uso" 
              />
              <Button 
              variant='contained'
              required
              style={{backgroundColor: '#8D5CF6'}}
              onClick={()=>{
                window.open('/public/PAUTAS GENERALES para USO de INSTALACIONES Y RECURSOS ConectarLAB Chaco (MODIF.).docx.pdf', '_blank');
              }}
              >
              Ver Condiciones 
              </Button>
            </Grid>
            <Grid container alignItems="center" sx={{mt:1}}>
            <Typography style={{marginLeft:25}}>
            Formulario de autorización de Imagen
            </Typography>
            <Button
              onClick={handleDescarga}
              variant="contained"
              style={{ backgroundColor: '#8D5CF6', marginLeft:25 }}
            >
              Descargar Formulario <DownloadIcon />
          </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Button variant="contained" style={{backgroundColor: '#E7214E'}} onClick={()=>{
                  setFormData({
                    cue: '',
                    nombreEscuela: '',
                    localidadEscuela: '',
                    nombreDirector: '',
                    grado: '',
                    turno: 'Mañana',
                    cantAlumnos: '',
                    telefono: '',
                    email: '',
                    fechaVisita: '',
                    horario: '',
                    estado: 'ACTIVADO',
                });
                setMostrarHorarioInput(false);
                setErrores({});
                
                }}>
                  Cancelar
                </Button>
                <Button variant="contained" type="submit" style={{backgroundColor: '#7038C3', marginLeft:'5px'}}>
                  Enviar
                </Button>
              </Box>
            </Grid>
          </Grid>
    
          <Calendario
            open={calendarioOpen}
            onClose={() => setCalendarioOpen(false)}
            onDateClick={handleDateChange}
            selectedDate={formData.fechaVisita}
          />
    
          <Horario 
            open={horarioOpen} 
            onClose={() => setHorarioOpen(false)} 
            onHorarioChange={handleHorarioChange} 
            horariosOcupados={horariosOcupados}
          />
        </Box>
      );
      
    };
    
    export default EducacionForm;