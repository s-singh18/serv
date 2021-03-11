import re

from .models import User, Listing, Review

class ListingValidation():

    def check_create_listing(self, title, listing_type, address, description, username):
        error = []
        if self.check_title(title) is not None:
            error.append(self.check_title(title))
        if self.check_type(listing_type) is not None:
            error.append(self.check_type(listing_type))
        if self.check_address(address) is not None:
            error.append(self.check_address(address))
        if self.check_description(description) is not None:
            error.append(self.check_description(description))
        if self.check_unique(username) is not None:
            error.append(self.check_unique(username))


        return error

    def check_edit_listing(self, title, listing_type, address, description):
        error = []
        if self.check_title(title) is not None:
            error.append(self.check_title(title))
        if self.check_type(listing_type) is not None:
            error.append(self.check_type(listing_type))
        if self.check_address(address) is not None:
            error.append(self.check_address(address))
        if self.check_description(description) is not None:
            error.append(self.check_description(description))

        return error

    def check_title(self, title):
        if title is "":
            error = "No title given"
        elif len(title) > 114:
            error = "Invalid title"
        elif re.match("^\w+$", title) is False:
            error = "Invalid title"
        elif title.isspace():
            error = "Invalid title"
        else:
            error = None
        return error

    def check_type(self, listing_type):
        if listing_type is "":
            error = "No type given"
        elif len(listing_type) > 114:
            error = "Invalid listing type"
        elif re.match("^\w+$", listing_type) is False:
            error = "Invalid listing type"
        elif listing_type.isspace():
            error = "Invalid listing type"
        else:
            error = None
        return error

    def check_address(self, address):
        if address is "":
            error = "No address given"
        elif re.match("^\w+$", address) is False:
            error = "Invalid address"
        elif address.isspace():
            error = "Invalid address"
        else:
            error = None
        return error

    def check_description(self, description):
        if description is "":
            error = "No description given"
        elif len(description) > 6000:
            error = "Invalid description"
        elif description.isspace():
            error = "Invalid description"
        else:
            error = None
        return error

    def check_unique(self, username):
        user = User.objects.get(username=username)
        if Listing.objects.filter(user=user).exists():
            error = "Limit one listing per user"
        else:
            error = None
        return error

class ReviewValidation():

    def check_review(self, text, stars, title, username):
        error = []
        if self.check_text(text) is not None:
            error.append(self.check_text(text))
        if self.check_stars(stars) is not None:
            error.append(self.check_stars(stars))
        if self.check_unique(title, username) is not None:
            error.append(self.check_unique(title, username))

        return error

    def check_stars(self, stars):
        if stars is "":
            error = "No stars given"
        elif int(stars) > 3 and int(stars) < 1:
            error = "Invalid review"
        else:
            error = None
        return error
        
    def check_text(self, text):
        if text is "":
            error = "No review given"
        elif len(text) > 6000:
            error = "Invalid review"
        elif text.isspace():
            error = "Invalid review"
        else:
            error = None
        return error

    def check_unique(self, title, username):
        user = User.objects.get(username=username)
        listing = Listing.objects.get(title=title)
        if Review.objects.filter(user=user, listing=listing).exists():
            error = "Review for this listing already exists"
        else:
            error = None
        return error
            