import React, { useState } from 'react';
import { TextField, Button, Box, Grid, Typography, IconButton, CardMedia } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';

const DocenteForm = ({talleres}) => {
  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState({
    nombreApellido: '',
    escuela: '',
    dni: '',
    email: '',
    telefono: '',
    estado: 'ACTIVADO',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/post/docente",{
        ...formData, tallerTitulo: talleres[index].titulo,
        tallerFecha: formatDate(talleres[index].fecha),
      });
      alert('El turno se agregó');
      setFormData({
        nombreApellido: '',
        escuela: '',
        dni: '',
        email: '',
        telefono: '',
        estado: 'ACTIVADO',
      });
    } catch (error) {
      console.error('Error al enviar el formulario', error);
      alert('Error al cargar');
    }
  };
  const handlePrevious = () => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : talleres.length - 1));
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex < talleres.length - 1 ? prevIndex + 1 : 0));
  };

  const tallerActual = talleres[index];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              paddingBottom: '8px',
              marginBottom: '16px',
              textTransform: 'capitalize',
              letterSpacing: '0.5px',
              fontSize: '1.5rem', 
            }}
          >
            {tallerActual.titulo}
          </Typography>
          {tallerActual.imagen && (
                      <CardMedia
                      component="img"
                      alt={tallerActual.titulo}
                      image={tallerActual.imagen}
                      title={tallerActual.titulo}
                      sx={{ 
                        display: 'block', 
                        margin: '0 auto', 
                        maxWidth: '35%', 
                        height: 'auto', 
                        marginBottom: 2  
                      }}
                    />
          )}
        </Box>

        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formatDate(tallerActual.fecha)}  
            disabled
            sx={{ mb: 2 }}
          />
        </Grid>
        
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nombre y Apellido"
            name="nombreApellido"
            value={formData.nombreApellido}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Escuela"
            name="escuela"
            value={formData.escuela}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="DNI"
            name="dni"
            type="number"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Número de Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        {talleres.length > 1 && (
          <IconButton onClick={handlePrevious} color="primary">
            <ArrowBackIosIcon />
          </IconButton>
        )}

      <Button variant="contained" style={{backgroundColor: '#E7214E'}} onClick={()=>{
      setFormData({
      nombreApellido: '',
      escuela: '',
      dni: '',
      email: '',
      telefono: '',
      estado: 'ACTIVADO',
      });
      }}
       >
        Cancelar
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          sx={{ minWidth: '120px' }}
          style={{backgroundColor: '#8D5CF6'}}
        >
          Enviar
        </Button>

        {talleres.length > 1 && (
          <IconButton onClick={handleNext} color="primary">
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>

    </Box>
  );
};

export default DocenteForm;