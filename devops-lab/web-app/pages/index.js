import React, { useState, useEffect } from 'react'; 
import Swal from 'sweetalert2';
import { Card, Button, TextField, Typography, List, ListItem, ListItemText, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #f0f4f8, #ffffff)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  logo: {
    width: '300px',
    marginBottom: '2rem',
  },
  formCard: {
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: '2rem',
    padding: '2rem',
  },
  formTitle: {
    color: '#5ec9c5',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  sectionTitle: {
    color: '#5ec9c5',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  submitButton: {
    marginTop: '2rem',
    padding: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: '#5ec9c5',
    color: 'white',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#4ba5a3',
    },
  },
  listCard: {
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: '2rem',
  },
  listTitle: {
    color: '#5ec9c5',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  petItem: {
    borderRadius: 8,
    marginBottom: '0.5rem',
    backgroundColor: '#f4f4f4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e57373',
    color: 'white',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
  selectField: {
    marginBottom: '1rem',
    width: '100%',
  },
});

export default function Home() {
  const classes = useStyles();

  const [nomeDono, setNomeDono] = useState('');
  const [telefoneDono, setTelefoneDono] = useState('');
  const [nomePet, setNomePet] = useState('');
  const [especiePet, setEspeciePet] = useState('');
  const [idadePet, setIdadePet] = useState('');
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const res = await fetch('/api/pets-list');
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      } else {
        Swal.fire('Erro ao carregar pets', 'Não foi possível carregar a lista de pets.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro de rede', 'Verifique sua conexão e tente novamente.', 'error');
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeDono,
          telefoneDono,
          nomePet,
          especiePet,
          idadePet: idadePet ? parseInt(idadePet, 10) : null,
        }),
      });

      if (res.ok) {
        setNomeDono('');
        setTelefoneDono('');
        setNomePet('');
        setEspeciePet('');
        setIdadePet('');

        await fetchPets();

        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado!',
          text: 'O pet foi cadastrado com sucesso.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire('Erro', 'Erro ao cadastrar o pet.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro de rede. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Deseja mesmo excluir este pet?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
        if (res.ok) {
          await fetchPets();
          Swal.fire('Deletado!', 'O pet foi removido com sucesso.', 'success');
        } else {
          Swal.fire('Erro', 'Erro ao deletar o pet.', 'error');
        }
      } catch (error) {
        Swal.fire('Erro', 'Erro de rede. Tente novamente.', 'error');
      }
    }
  };

  return (
    <div className={classes.container}>
      <img src="/logo.png" alt="Sistema PET" className={classes.logo} />

      <Card className={classes.formCard}>
        <Typography variant="h3" align="center" className={classes.formTitle}>
          Cadastro de Pets
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Nome do Dono" fullWidth margin="normal" value={nomeDono} onChange={(e) => setNomeDono(e.target.value)} disabled={loading} required inputProps={{pattern: "^[A-Za-zÀ-ÿ\\s]+$", title: "O nome não pode conter números ou símbolos." }}/>
          <TextField label="Telefone do Dono" fullWidth margin="normal" value={telefoneDono} onChange={(e) => setTelefoneDono(e.target.value)} disabled={loading} inputProps={{pattern: "^[0-9]{8,15}$",title: "Digite apenas números, entre 8 e 15 dígitos."}}/>
          <TextField label="Nome do Pet" fullWidth margin="normal" value={nomePet} onChange={(e) => setNomePet(e.target.value)} disabled={loading} required inputProps={{pattern: "^[A-Za-zÀ-ÿ\\s]+$", title: "O nome não pode conter números ou símbolos." }} />
          <FormControl fullWidth margin="normal" className={classes.selectField} disabled={loading} required>
            <InputLabel>Espécie</InputLabel>
            <Select value={especiePet} onChange={(e) => setEspeciePet(e.target.value)} label="Espécie">
              <MenuItem value="Cachorro">Cachorro</MenuItem>
              <MenuItem value="Gato">Gato</MenuItem>
              <MenuItem value="Pássaro">Pássaro</MenuItem>
              <MenuItem value="Coelho">Coelho</MenuItem>
              <MenuItem value="Hamster">Hamster</MenuItem>
              <MenuItem value="Outros">Outros</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Idade (anos)"
            fullWidth
            margin="normal"
            type="number"
            value={idadePet}
            onChange={(e) => setIdadePet(e.target.value)}
            disabled={loading}
            required
          />
          <Button type="submit" className={classes.submitButton} fullWidth disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>
      </Card>

      <Card className={classes.listCard}>
        <Typography variant="h4" align="center" className={classes.listTitle}>
          Lista de Pets
        </Typography>
        {loadingPets ? (
          <CircularProgress />
        ) : (
          <List>
            {pets.map((pet) => (
              <ListItem key={pet.id} divider className={classes.petItem}>
                <ListItemText
                  primary={pet.nome}
                  secondary={`Dono: ${pet.nome_dono} | Espécie: ${pet.especie} | Idade: ${pet.idade} anos`}
                />
                <Button className={classes.deleteButton} onClick={() => handleDelete(pet.id)}>
                  Deletar
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </div>
  );
}
