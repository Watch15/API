import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  getAll() {
    this.app.get('/albums/:albumId/photos', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.albumId).populate('photos')
          .then((album) => {
            res.status(200).json(album.photos || []);
          })
          .catch(() => {
            res.status(400).json({
              code: 400,
              message: 'Bad request'
            });
          });
      } catch (err) {
        console.error(`[ERROR] albums/:albumId/photos -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getById() {
    this.app.get('/albums/:albumId/photos/:photoId', (req, res) => {
      try {
        this.PhotoModel.findOne({
          _id: req.params.photoId,
          album: req.params.albumId
        })
          .then((photo) => {
            res.status(200).json(photo || {});
          })
          .catch(() => {
            res.status(400).json({
              code: 400,
              message: 'Bad request'
            });
          });
      } catch (err) {
        console.error(`[ERROR] albums/:albumId/photos/:photoId -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  async create() {
    this.app.post('/albums/:id/photo/', async (req, res) => {
      try {
        const photoModel = new this.PhotoModel(req.body);
        const photo = await photoModel.save();
        const idAlbum = req.params.id;
        const idPhoto = photo.id;
        console.log(photo, idPhoto, idAlbum);
        await this.AlbumModel.findByIdAndUpdate(
          idAlbum,
          { $push: { photos: idPhoto } },
          { new: true, useFindAndModify: false }
        ).then((album) => {
          console.log(album);
        });
        res.status(200).json(photo || {});
      } catch (err) {
        console.error(`[ERROR] photos/create -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  update() {
    this.app.put('/albums/:albumId/photos/:photoId', (req, res) => {
      try {
        const { title, description, url } = req.body;
        this.PhotoModel.findOneAndUpdate(
          { _id: req.params.photoId, album: req.params.albumId },
          { title, description, url },
          { new: true }
        )
          .then((photo) => {
            res.status(200).json(photo || {});
          })
          .catch(() => {
            res.status(400).json({
              code: 400,
              message: 'Bad request'
            });
          });
      } catch (err) {
        console.error(`[ERROR] albums/:albumId/photos/:photoId -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  async delete() {
    this.app.delete('/albums/:albumId/photos/:photoId', async (req, res) => {
      try {
        const photo = await this.PhotoModel.findOneAndDelete({
          _id: req.params.photoId,
          album: req.params.albumId
        });
        if (!photo) {
          return res.status(404).json({
            code: 404,
            message: 'Photo non trouvée'
          });
        }
        await this.AlbumModel.findByIdAndUpdate(
          req.params.albumId,
          { $pull: { photos: req.params.photoId } },
          { new: true, useFindAndModify: false }
        );
        // Ajoutez ici un retour après l'envoi de la réponse
        return res.status(200).json(photo);
      } catch (err) {
        console.error(`[ERROR] albums/:albumId/photos/:photoId -> ${err}`);
        return res.status(500).json({
          code: 500,
          message: 'Erreur interne du serveur'
        });
      }
    });
  }

  run() {
    this.getAll();
    this.getById();
    this.create();
    this.update();
    this.delete();
  }
};

export default Photos;
