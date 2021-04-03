import re

from .models import User, Listing, Review

class ListingValidation():

    def check_create_listing(self, title, listing_type, address, description, username):
        error = []
        if self.check_title(title) != None:
            error.append(self.check_title(title))
        if Listing.objects.filter(title=title).exists():
            error.append("Listing with that title already exists")
        if self.check_type(listing_type) != None:
            error.append(self.check_type(listing_type))
        if self.check_address(address) != None:
            error.append(self.check_address(address))
        if self.check_description(description) != None:
            error.append(self.check_description(description))
        if self.check_unique(username) != None:
            error.append(self.check_unique(username))
        return error

    def check_edit_listing(self, title, listing_type, address, description):
        error = []
        if self.check_title(title) != None:
            error.append(self.check_title(title))
        if self.check_type(listing_type) != None:
            error.append(self.check_type(listing_type))
        if self.check_address(address) != None:
            error.append(self.check_address(address))
        if self.check_description(description) != None:
            error.append(self.check_description(description))

        return error

    def check_title(self, title):
        if title == "":
            error = "No title given"
        elif len(title) > 114:
            error = "Invalid title"
        elif re.match("^\w+$", title) == False:
            error = "Invalid title"
        elif title.isspace():
            error = "Invalid title"
        else:
            error = None
        return error

    def check_type(self, listing_type):
        if listing_type == "":
            error = "No type given"
        elif len(listing_type) > 114:
            error = "Invalid listing type"
        elif re.match("^\w+$", listing_type) == False:
            error = "Invalid listing type"
        elif listing_type.isspace():
            error = "Invalid listing type"
        else:
            error = None
        return error

    def check_address(self, address):
        if address == "":
            error = "No address given"
        elif re.match("^\w+$", address) == False:
            error = "Invalid address"
        elif address.isspace():
            error = "Invalid address"
        else:
            error = None
        return error

    def check_description(self, description):
        if description == "":
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
        if stars == "":
            error = "No stars given"
        elif int(stars) > 3 and int(stars) < 1:
            error = "Invalid review"
        else:
            error = None
        return error
        
    def check_text(self, text):
        if text == "":
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
            
class ServiceValidation():

    def check_create_service(self, name, rate, times):
        error = []
        if self.check_name(name) != None:
            error.append(self.check_name(name))
        if self.check_rate(rate) != None:
            error.append(self.check_rate(rate))
        if self.check_times(times) != None:
            error.append(self.check_times(times))
        return error


    def check_name(self, name):
        if name == "":
            error = "No name given"
        elif len(name) > 114:
            error = "Invalid name"
        elif re.match("^\w+$", name) == False:
            error = "Invalid name"
        elif name.isspace():
            error = "Invalid name"
        else:
            error = None
        return error

    def check_rate(self, rate):
        if rate == "":
            error = "No rate given"
        elif len(rate) > 9:
            error = "Invalid rate"
        elif re.match("^[0-9]+$", rate) is False:
            error = "Invalid rate"
        else:
            error = None
        return error

    def check_times(self, times):
        if times == "" or times == "-;-;-;-;-;-;-":
            error = "No times given"
        elif len(times) > 3000:
            error = "Invalid times"
        elif re.match("[0-9:;-]", times) is False:
            error = "Invalid times"
        else:
            error = None
        return error