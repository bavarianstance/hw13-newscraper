// init fcns

// scrape article fcn
    const scrapeArticles = () =>{
        $.get('/scraper')
        .then((data)=>{
            // $('body').html(data);
            location.reload();
        });
    };

// clip article fcn
    const saveArticle = function() {
        let id = $(this).data('id');

        $.ajax({
            url: `/article/${id}`,
            method: 'PUT'
        })
        .then((data)=>{
            location.reload();
        });
    };
// delete article fcn
    const removeArticle = function() {
        let id = $(this).data('id');
        
        $.ajax({
            url: `/article/remove/${id}`,
            method: 'PUT'
        })
        .then((data)=>{
            location.reload();
        });
    };
// see notes fcn
    const viewNotes = function() {
        let articleId = $(this).data('id');


        $.ajax({
            url: `/article/${articleId}`,
            method: 'GET'
        })
        .then((data)=>{
// init modal for notes feature
            $(".modal-content").html(`
                <div class="modal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                    <div class="modal-content">
                     <div class="modal-header">
                      <h5 class="modal-title">${data.title}</h5>
                 <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
              </button>
              </div>
      <div class="modal-body">
        <ul class="list-group"></ul>
        <textarea id="add-note" class="form-control note-content" placeholder="enter your note here..."></textarea>
      </div>
          <div class="modal-footer">
        <button type="button" data-id="${data._id}" class="btn btn-primary btn-save-note">Save Note</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`);

            // console.log(data);
            // console.log(data.note);
            // assign notes object array to notes var
            let notes = data.note;
            // logic to determine if notes is empty
            if (notes.length === 0) {
                let message = `<small class="text-muted">Whoops, no notes found. Try adding some.</small>`;
                $('.modal-body').prepend(message);
            }
            else {
                console.log(notes);
                // iterates thru notes object and appends each to modal
                    notes.forEach(note =>{
                    $('.list-group').append(`
                        <li class="list-group-item justify-content-between">
                            ${note.body}
                            <span><i class="fas fa-trash-alt" data-id="${note._id}"></i></span>
                        </li>
                    `);
                });
            }
            // init modal view
            $('.modal').modal('show');
        });
    };
// save note fcn
    const saveNote = function() {
        // grabs associated data 
        let id = $(this).data('id');
        let content = $('.note-content').val().trim();
        // logic for ajax call
        if (content) {
            $.ajax({
                url: `/note/${id}`,
                method: 'POST',
                data: {body: content}
            })
            .then((data)=>{
                // logic after promise function to capture inputs for notes
                $('.note-content').val('');
                $('.modal').modal('hide');
            });
        }
        else {
            $('.note-content').val('');
            return;
        }
    };

// delete note function
    const deleteNote = function() {
        let id = $(this).data('id');
        // ajax call for delete in db
        $.ajax({
            url: `/note/${id}`,
            method: 'DELETE'
        })
        .then((data)=>{
            // promise execution logic for hiding modal
            $('.modal').modal('hide');
        });
    };

// logic to hide scraper button if on clipped articles page
    if (window.location.href.includes('clipped')) {
        $('.scraper').hide();
    }

// keeps contentbox pinned for best viewing
    const contentBox = $('.note-content');
    contentBox.scrollTop = contentBox.scrollHeight;

// on click event listeners
    $('.scraper').on('click', scrapeArticles);
    $('.clip-button').on('click', saveArticle);
    $('.delete-button').on('click', removeArticle);
    $('.notes-button').on('click', viewNotes);
// click event listeners for dynamically generated elements
    $(document).on('click', '.btn-save-note', saveNote);
    $(document).on('click', '.fa-trash-alt', deleteNote);
