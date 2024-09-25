import AlbumModel from '../models/album.mjs';
import PhotoModel from '../models/photo.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);

    this.run();
  }

  create() {
    this.app.post('/albums', (req, res) => {
      try {
        const albumModel = new this.AlbumModel(req.body);
        albumModel.save().then((album) => {
          res.status(200).json(album || {});
        });
      } catch (err) {
        console.error(`[ERROR] albums/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Mauvaise requête'
        });
      }
    });
  }

  getAll() {
    this.app.get('/albums', (req, res) => {
      try {
        this.AlbumModel.find().populate('photos').then((albums) => {
          res.status(200).json(albums || []);
        });
      } catch (err) {
        console.error(`[ERROR] albums/getAll -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Mauvaise requête'
        });
      }
    });
  }

  getById() {
    this.app.get('/albums/:id', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).populate('photos').then((album) => {
          res.status(200).json(album || {});
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Mauvaise requête'
        });
      }
    });
  }

  updateById() {
    this.app.put('/albums/:id', (req, res) => {
      try {
        const { title, description, photos } = req.body;

        this.AlbumModel.findByIdAndUpdate(req.params.id, { title, description, photos }, { new: true, runValidators: true }).populate('photos').then((album) => {
          res.status(200).json(album || {});
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Mauvaise requête'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/albums/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          this.PhotoModel.deleteMany({ album: album._id }).then(() => {
            res.status(200).json({ message: 'Album et photos supprimés avec succès' });
          });
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Erreur interne du serveur'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Mauvaise requête'
        });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.updateById();
    this.deleteById();
  }
};

export default Albums;
