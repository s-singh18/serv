import re

from .models import User, Listing, Review, Service


class UserValidation():
    def check_registration(self, username, email, password, confirmation):
        errors = []
        if self.check_username(username) != None:
            errors.append(self.check_username(username))
        if self.check_email(email) != None:
            errors.append(self.check_email(email))
        if self.check_password(password) != None:
            errors.append(self.check_password(password))
        if self.check_confirmation(password, confirmation) != None:
            errors.append(self.check_confirmation(password, confirmation))
        return errors

    def check_username(self, username):
        if not username:
            error = "Username not given"
        elif len(username) > 60:
            error = "Username too long"
        elif username.isspace():
            error = "Invalid Username"
        elif re.match("^\w+$", username) == False:
            error = "Invalid Username"
        else:
            error = None
        return error

    def check_email(self, email):
        if not email:
            error = "Email not given"
        elif re.match("[^@]+@[^@]+\.[^@]+", email) == False:
            error = "Invalid Email"
        elif email.isspace():
            error = "Invalid Email"
        else:
            error = None
        return error

    def check_password(self, password):
        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,}$"
        match_re = re.search(reg, password)
        if not password:
            error = "Password not given"
        elif not match_re:
            error = "Password must contain a minimum six characters, at least one uppercase character, one lowercase character, one number and one special character."
        elif password.isspace():
            error = "Invalid Password"
        else:
            error = None
        return error

    def check_confirmation(self, password, confirmation):
        if not confirmation or confirmation != password:
            error = "Passwords must match"
        else:
            error = None
        return error


class ListingValidation():

    def check_create_listing(self, title, category, address, description, user_id):
        error = []
        if self.check_title(title) != None:
            error.append(self.check_title(title))
        if Listing.objects.filter(title=title).exists():
            error.append("Listing with that title already exists")
        if self.check_type(category) != None:
            error.append(self.check_type(category))
        if self.check_address(address) != None:
            error.append(self.check_address(address))
        if self.check_description(description) != None:
            error.append(self.check_description(description))
        if self.check_unique(user_id) != None:
            error.append(self.check_unique(user_id))
        return error

    def check_edit_listing(self, title, category, address, description):
        error = []
        if self.check_title(title) != None:
            error.append(self.check_title(title))
        if self.check_type(category) != None:
            error.append(self.check_type(category))
        if self.check_address(address) != None:
            error.append(self.check_address(address))
        if self.check_description(description) != None:
            error.append(self.check_description(description))

        return error

    def check_title(self, title):
        if not title:
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

    def check_type(self, category):
        if not category:
            error = "No type given"
        elif len(category) > 114:
            error = "Invalid listing type"
        elif re.match("^\w+$", category) == False:
            error = "Invalid listing type"
        elif category.isspace():
            error = "Invalid listing type"
        else:
            error = None
        return error

    def check_address(self, address):
        if not address:
            error = "No address given"
        elif re.match("^\w+$", address) == False:
            error = "Invalid address"
        elif address.isspace():
            error = "Invalid address"
        else:
            error = None
        return error

    def check_description(self, description):
        if not description:
            error = "No description given"
        elif len(description) > 6000:
            error = "Invalid description"
        elif description.isspace():
            error = "Invalid description"
        else:
            error = None
        return error

    def check_unique(self, user_id):
        user = User.objects.get(id=user_id)
        if Listing.objects.filter(user=user).exists():
            error = "Limit one listing per user"
        else:
            error = None
        return error


class ReviewValidation():

    def check_review(self, header, body, listing_id, user_id):
        error = []
        if self.check_header(header) is not None:
            error.append(self.check_header(header))
        if self.check_body(body) is not None:
            error.append(self.check_body(body))
        if self.check_unique(listing_id, user_id) is not None:
            error.append(self.check_unique(listing_id, user_id))

        return error

    def check_header(self, header):
        if not header:
            error = "No header given"
        elif len(header) > 300:
            error = "Max review header length 300 characters"
        elif header.isspace():
            error = "Invalid review header"
        else:
            error = None
        return error

    def check_body(self, body):
        if not body:
            error = "No body given"
        elif len(body) > 6000:
            error = "Max review body length 6000 characters"
        elif body.isspace():
            error = "Invalid review body"
        else:
            error = None
        return error

    def check_unique(self, listing_id, user_id):
        user = User.objects.get(id=user_id)
        listing = Listing.objects.get(id=listing_id)
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

    def check_edit_service(self, name, rate, times):
        error = []
        if self.check_name(name) != None:
            error.append(self.check_name(name))
        if self.check_rate(rate) != None:
            error.append(self.check_rate(rate))
        if self.check_times(times) != None:
            error.append(self.check_times(times))
        return error

    def check_name(self, name):
        if not name:
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
        if not rate:
            error = "No rate given"
        elif len(rate) > 9:
            error = "Invalid rate"
        elif re.match("^[0-9]+$", rate) is False:
            error = "Invalid rate"
        elif int(rate) < 0:
            error = "Invalid rate"
        else:
            error = None
        return error

    def check_times(self, times):
        if not times:
            error = "No times given"
        elif len(times) > 3000:
            error = "Invalid times"
        elif re.match("[0-9:;-]", times) is False:
            error = "Invalid times"
        else:
            error = None
        return error
