from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
import os


class Command(BaseCommand):
    help = (
        "Cree ou met a jour le compte administrateur du back-office "
        "a partir des variables ADMIN_USERNAME et ADMIN_PASSWORD."
    )

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME", "angelo")
        password = os.environ.get("ADMIN_PASSWORD", "")

        if not password:
            self.stdout.write(
                self.style.WARNING(
                    "ADMIN_PASSWORD non defini : aucun compte cree ni modifie."
                )
            )
            return

        User = get_user_model()

        try:
            user = User.objects.get(username=username)
            created = False
        except User.DoesNotExist:
            user = User(username=username)
            created = True

        user.is_staff = True
        user.is_active = True
        user.set_password(password)
        user.save()

        action = "cree" if created else "mis a jour"
        self.stdout.write(
            self.style.SUCCESS(f"Compte administrateur '{username}' {action}.")
        )
